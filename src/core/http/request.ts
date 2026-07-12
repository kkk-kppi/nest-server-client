import { isAxiosError } from 'axios'
import type { AxiosError, AxiosResponse } from 'axios'
import { http } from './client'
import type { ApiResponse, AppHttpError, RetryRequestConfig } from './types'

// Default success code for API responses
const DEFAULT_SUCCESS_CODE = 0

export interface ResponseParser<TData> {
  (response: unknown): TData
}

export interface EndpointConfig<TData = unknown> {
  successCode?: number
  responseParser?: ResponseParser<TData>
}

function isApiResponse<TData>(payload: unknown): payload is ApiResponse<TData> {
  if (!payload || typeof payload !== 'object') {
    return false
  }

  return 'code' in payload && 'message' in payload && 'data' in payload
}

function validateApiResponse<TData>(data: unknown, config?: EndpointConfig<TData>): TData {
  const successCode = config?.successCode ?? DEFAULT_SUCCESS_CODE

  if (!isApiResponse<TData>(data)) {
    // If not an API response envelope, return as-is (for backward compatibility)
    return data as TData
  }

  // Check business error code
  if (data.code !== successCode) {
    const error = new Error(data.message || `Business error code: ${data.code}`) as AppHttpError
    error.kind = 'server'
    error.status = data.code
    error.payload = data
    throw error
  }

  // Use custom parser if provided
  if (config?.responseParser) {
    return config.responseParser(data.data)
  }

  return data.data
}

function unwrapResponse<TData>(
  response: AxiosResponse<ApiResponse<TData> | TData>,
  config?: EndpointConfig<TData>,
) {
  return validateApiResponse<TData>(response.data, config)
}

export function toAppHttpError(error: unknown): AppHttpError {
  // Handle AppHttpError thrown by validateApiResponse
  if (error && typeof error === 'object' && 'kind' in error) {
    return error as AppHttpError
  }

  if (!isAxiosError(error)) {
    const fallbackError = new Error('Unknown request error') as AppHttpError
    fallbackError.kind = 'unknown'
    return fallbackError
  }

  const axiosError = error as AxiosError<ApiResponse<unknown>>
  const appError = new Error(axiosError.message) as AppHttpError
  appError.status = axiosError.response?.status
  appError.code = axiosError.code
  appError.payload = axiosError.response?.data

  if (axiosError.code === 'ERR_CANCELED') {
    appError.kind = 'canceled'
    return appError
  }

  if (axiosError.code === 'ECONNABORTED') {
    appError.kind = 'timeout'
    return appError
  }

  if (!axiosError.response) {
    appError.kind = 'network'
    return appError
  }

  if (axiosError.response.status >= 500) {
    appError.kind = 'server'
    return appError
  }

  appError.kind = 'unknown'
  return appError
}

export interface RequestConfig extends RetryRequestConfig {
  endpoint?: EndpointConfig
}

export async function request<TData = unknown>(config: RequestConfig) {
  try {
    const { endpoint, ...axiosConfig } = config
    const response = await http.request<ApiResponse<TData> | TData>(axiosConfig)
    return unwrapResponse<TData>(response, endpoint as EndpointConfig<TData>)
  } catch (error) {
    throw toAppHttpError(error)
  }
}

export async function get<TData = unknown>(
  url: string,
  config?: Omit<RequestConfig, 'url' | 'method'>,
) {
  return request<TData>({
    ...config,
    url,
    method: 'get',
  })
}

export async function post<TData = unknown, TBody = unknown>(
  url: string,
  data?: TBody,
  config?: Omit<RequestConfig, 'url' | 'method' | 'data'>,
) {
  return request<TData>({
    ...config,
    url,
    method: 'post',
    data,
  })
}

export async function put<TData = unknown, TBody = unknown>(
  url: string,
  data?: TBody,
  config?: Omit<RequestConfig, 'url' | 'method' | 'data'>,
) {
  return request<TData>({
    ...config,
    url,
    method: 'put',
    data,
  })
}

export async function patch<TData = unknown, TBody = unknown>(
  url: string,
  data?: TBody,
  config?: Omit<RequestConfig, 'url' | 'method' | 'data'>,
) {
  return request<TData>({
    ...config,
    url,
    method: 'patch',
    data,
  })
}

export async function del<TData = unknown>(
  url: string,
  config?: Omit<RequestConfig, 'url' | 'method'>,
) {
  return request<TData>({
    ...config,
    url,
    method: 'delete',
  })
}
