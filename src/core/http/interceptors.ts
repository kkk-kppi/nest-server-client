import { AxiosHeaders } from 'axios'
import type { AxiosError, AxiosInstance, AxiosResponse, InternalAxiosRequestConfig } from 'axios'
import type { ApiResponse, RetryRequestConfig } from './types'

const IDEMPOTENT_METHODS = new Set(['get', 'head', 'options'])
const RETRY_STATUS = new Set([408, 429, 500, 502, 503, 504])
const DEFAULT_RETRY = 2
const DEFAULT_RETRY_DELAY = 300

let accessTokenGetter: (() => string) | undefined
let unauthorizedHandler: (() => void) | undefined
let unauthorizedHandling = false
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

  pendingRequestMap.delete(dedupeKey)
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

export function setupInterceptors(http: AxiosInstance) {
  http.interceptors.request.use((config: InternalAxiosRequestConfig) => {
    const retryConfig = config as RetryRequestConfig
    withRetryDefaults(retryConfig)
    if (!retryConfig.skipDedupeCancel) {
      const dedupeKey = createDedupeKey(retryConfig)
      const previousController = pendingRequestMap.get(dedupeKey)
      if (previousController) {
        previousController.abort()
      }

      const abortController = new AbortController()
      retryConfig.signal = abortController.signal
      retryConfig.__dedupeKey = dedupeKey
      pendingRequestMap.set(dedupeKey, abortController)
    }

    const accessToken = accessTokenGetter?.()

    if (accessToken) {
      const headers = AxiosHeaders.from(config.headers)
      headers.set('Authorization', `Bearer ${accessToken}`)
      config.headers = headers
    }

    return config
  })

  http.interceptors.response.use(
    (response: AxiosResponse<ApiResponse<unknown>>) => {
      removePendingRequest(response.config as RetryRequestConfig)
      return response
    },
    async (error: AxiosError<ApiResponse<unknown>>) => {
      removePendingRequest(error.config as RetryRequestConfig)

      if (error.response?.status === 401) {
        if (!unauthorizedHandling) {
          unauthorizedHandling = true
          unauthorizedHandler?.()
          Promise.resolve().finally(() => {
            unauthorizedHandling = false
          })
        }
        return Promise.reject(error)
      }

      if (error.response?.status === 403) {
        return Promise.reject(error)
      }

      if (error.response?.status === 500) {
        return Promise.reject(error)
      }

      const config = error.config as RetryRequestConfig | undefined
      const retry = config?.retry ?? 0
      const retryDelay = config?.retryDelay ?? DEFAULT_RETRY_DELAY
      const retryCount = config?.retryCount ?? 0

      if (!config || retryCount >= retry || !isRetriable(error)) {
        return Promise.reject(error)
      }

      config.retryCount = retryCount + 1
      await sleep(retryDelay * 2 ** retryCount)
      config.skipDedupeCancel = true
      return http.request(config)
    },
  )
}

export function setAccessTokenGetter(getter: () => string) {
  accessTokenGetter = getter
}

export function setUnauthorizedHandler(handler: () => void) {
  unauthorizedHandler = handler
}
