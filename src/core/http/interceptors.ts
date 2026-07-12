import { AxiosHeaders } from 'axios'
import type { AxiosError, AxiosInstance, AxiosResponse, InternalAxiosRequestConfig } from 'axios'
import type { ApiResponse, RetryRequestConfig } from './types'

const IDEMPOTENT_METHODS = new Set(['get', 'head', 'options'])
const RETRY_STATUS = new Set([408, 429, 500, 502, 503, 504])
const DEFAULT_RETRY = 2
const DEFAULT_RETRY_DELAY = 300

let accessTokenGetter: (() => string) | undefined
let unauthorizedHandler: (() => void | Promise<void>) | undefined
let unauthorizedInFlight: Promise<void> | null = null
const allowedOrigins: Set<string> = new Set()
const pendingRequestMap = new Map<string, AbortController>()

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

function withRetryDefaults(config: RetryRequestConfig | undefined) {
  if (!config) {
    return
  }

  config.retry = config.retry ?? DEFAULT_RETRY
  config.retryDelay = config.retryDelay ?? DEFAULT_RETRY_DELAY
}

function serializePayload(payload: unknown) {
  if (payload === undefined || payload === null) {
    return ''
  }

  if (typeof payload === 'string') {
    return payload
  }

  if (typeof payload === 'object') {
    try {
      return JSON.stringify(payload)
    } catch {
      return String(payload)
    }
  }

  return String(payload)
}

function createDedupeKey(config: RetryRequestConfig) {
  if (config.dedupeKey) {
    return config.dedupeKey
  }

  const method = String(config.method ?? 'get').toLowerCase()
  const url = String(config.url ?? '')
  const params = serializePayload(config.params)
  const data = serializePayload(config.data)
  return `${method}:${url}?${params}:${data}`
}

function removePendingRequest(config: RetryRequestConfig | undefined) {
  const dedupeKey = config?.__dedupeKey
  if (!dedupeKey) {
    return
  }

  // Compare-and-delete: only remove if the controller in the map is the same
  // This prevents removing a newer request that replaced this one
  const currentController = pendingRequestMap.get(dedupeKey)
  if (currentController === config?.__abortController) {
    pendingRequestMap.delete(dedupeKey)
  }
}

function isRetriable(error: AxiosError<ApiResponse<unknown>>) {
  const method = error.config?.method?.toLowerCase()
  const status = error.response?.status

  if (!method || !IDEMPOTENT_METHODS.has(method)) {
    return false
  }

  if (!status) {
    return true
  }

  return RETRY_STATUS.has(status)
}

function isCanceledError(error: AxiosError<ApiResponse<unknown>>): boolean {
  return (
    error.code === 'ERR_CANCELED' ||
    error.name === 'CanceledError' ||
    error.name === 'AbortError' ||
    Boolean(error.message && error.message.includes('canceled'))
  )
}

function isAllowedOrigin(url: string): boolean {
  try {
    // Relative URLs are always allowed (same origin)
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      return true
    }

    const parsedUrl = new URL(url)
    const origin = parsedUrl.origin

    // Check if origin is in allowed list
    return allowedOrigins.has(origin)
  } catch {
    // If URL parsing fails, assume it's a relative URL
    return true
  }
}

export function setupInterceptors(http: AxiosInstance, apiBaseUrl?: string) {
  // Set up allowed origins from API base URL
  if (apiBaseUrl) {
    try {
      const parsed = new URL(apiBaseUrl)
      allowedOrigins.add(parsed.origin)
    } catch {
      // If parsing fails, assume same origin
    }
  }

  http.interceptors.request.use((config: InternalAxiosRequestConfig) => {
    const retryConfig = config as RetryRequestConfig
    withRetryDefaults(retryConfig)

    // Always create an AbortController for this request
    const abortController = new AbortController()
    retryConfig.__abortController = abortController

    if (!retryConfig.skipDedupeCancel) {
      const dedupeKey = createDedupeKey(retryConfig)
      const previousController = pendingRequestMap.get(dedupeKey)

      // Only abort if there's a previous controller (deduplication)
      if (previousController) {
        previousController.abort()
      }

      // Use caller's signal if provided, otherwise use our controller
      if (retryConfig.signal) {
        // Listen to caller's abort signal
        retryConfig.signal.addEventListener?.('abort', () => {
          abortController.abort()
        })
      }

      retryConfig.signal = abortController.signal
      retryConfig.__dedupeKey = dedupeKey
      pendingRequestMap.set(dedupeKey, abortController)
    } else {
      // For retry requests, use the abort controller directly
      retryConfig.signal = abortController.signal
    }

    const accessToken = accessTokenGetter?.()

    // Only add auth header for allowed origins
    if (accessToken && config.url) {
      const fullUrl = config.baseURL ? new URL(config.url, config.baseURL).toString() : config.url

      if (isAllowedOrigin(fullUrl)) {
        const headers = AxiosHeaders.from(config.headers)
        headers.set('Authorization', `Bearer ${accessToken}`)
        config.headers = headers
      }
    }

    return config
  })

  http.interceptors.response.use(
    (response: AxiosResponse<ApiResponse<unknown>>) => {
      removePendingRequest(response.config as RetryRequestConfig)
      return response
    },
    async (error: AxiosError<ApiResponse<unknown>>) => {
      const config = error.config as RetryRequestConfig | undefined

      // Don't retry canceled requests
      if (isCanceledError(error)) {
        removePendingRequest(config)
        return Promise.reject(error)
      }

      removePendingRequest(config)

      if (error.response?.status === 401) {
        // Single-flight: only execute unauthorized handler once for concurrent 401s
        if (!unauthorizedInFlight) {
          unauthorizedInFlight = Promise.resolve()
            .then(() => unauthorizedHandler?.())
            .catch(() => {
              // Silently handle errors in unauthorized handler to prevent unhandled rejections
            })
            .finally(() => {
              unauthorizedInFlight = null
            })
        }

        // Wait for the unauthorized handler to complete before rejecting
        await unauthorizedInFlight
        return Promise.reject(error)
      }

      if (error.response?.status === 403) {
        return Promise.reject(error)
      }

      if (error.response?.status === 500) {
        return Promise.reject(error)
      }

      const retry = config?.retry ?? 0
      const retryDelay = config?.retryDelay ?? DEFAULT_RETRY_DELAY
      const retryCount = config?.retryCount ?? 0

      if (!config || retryCount >= retry || !isRetriable(error)) {
        return Promise.reject(error)
      }

      config.retryCount = retryCount + 1
      await sleep(retryDelay * 2 ** retryCount)

      // Re-register this request as the current pending request for deduplication
      if (config.__dedupeKey) {
        const newController = new AbortController()
        config.__abortController = newController
        config.signal = newController.signal
        pendingRequestMap.set(config.__dedupeKey, newController)
      }

      return http.request(config)
    },
  )
}

export function setAccessTokenGetter(getter: () => string) {
  accessTokenGetter = getter
}

export function setUnauthorizedHandler(handler: () => void | Promise<void>) {
  unauthorizedHandler = handler
}

export function addAllowedOrigin(origin: string): void {
  allowedOrigins.add(origin)
}

export function clearAllowedOrigins(): void {
  allowedOrigins.clear()
}
