import type { AxiosError, AxiosRequestConfig } from 'axios'

export interface ApiResponse<TData> {
  code: number
  message: string
  data: TData
}

export interface PageQuery {
  page: number
  pageSize: number
}

export interface PageMeta {
  page: number
  pageSize: number
  total: number
}

export interface PageResult<TItem> {
  items: TItem[]
  meta: PageMeta
}

export interface RetryRequestConfig extends AxiosRequestConfig {
  retry?: number
  retryDelay?: number
  retryCount?: number
  dedupeKey?: string
  skipDedupeCancel?: boolean
  __dedupeKey?: string
  __abortController?: AbortController
}

export type HttpError = AxiosError<ApiResponse<unknown>>
export type HttpMethod = 'get' | 'post' | 'put' | 'patch' | 'delete'

export interface AppHttpError extends Error {
  kind: 'timeout' | 'network' | 'canceled' | 'server' | 'unknown'
  status?: number
  code?: string
  payload?: unknown
}

export type { ResponseParser, EndpointConfig, RequestConfig } from './request'
