import { isAxiosError } from 'axios'
import type { AxiosError, AxiosResponse } from 'axios'
import { http } from './client'
import type { ApiResponse, AppHttpError, RetryRequestConfig } from './types'

function isApiResponse<TData>(payload: unknown): payload is ApiResponse<TData> {
  if (!payload || typeof payload !== 'object') {
    return false
  }

  return 'code' in payload && 'message' in payload && 'data' in payload
}

function unwrapResponse<TData>(response: AxiosResponse<ApiResponse<TData> | TData>) {
  if (isApiResponse<TData>(response.data)) {
    return response.data.data
  }

  return response.data
}

export function toAppHttpError(error: unknown): AppHttpError {
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

export async function request<TData = unknown>(config: RetryRequestConfig) {
  try {
    const response = await http.request<ApiResponse<TData> | TData>(config)
    return unwrapResponse<TData>(response)
  } catch (error) {
    throw toAppHttpError(error)
  }
}

export async function get<TData = unknown>(
  url: string,
  config?: Omit<RetryRequestConfig, 'url' | 'method'>,
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
  config?: Omit<RetryRequestConfig, 'url' | 'method' | 'data'>,
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
  config?: Omit<RetryRequestConfig, 'url' | 'method' | 'data'>,
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
  config?: Omit<RetryRequestConfig, 'url' | 'method' | 'data'>,
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
  config?: Omit<RetryRequestConfig, 'url' | 'method'>,
) {
  return request<TData>({
    ...config,
    url,
    method: 'delete',
  })
}
