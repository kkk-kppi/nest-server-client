import { del, get, patch, post, put } from './request'
import type { HttpMethod, RetryRequestConfig } from './types'

export interface ApiEndpoint<
  TMethod extends HttpMethod,
  TPath extends string,
  TRequest = void,
  TResponse = unknown,
> {
  method: TMethod
  path: TPath
  request: TRequest
  response: TResponse
}

export type InferEndpointRequest<
  TEndpoint extends ApiEndpoint<HttpMethod, string, unknown, unknown>,
> = TEndpoint extends ApiEndpoint<HttpMethod, string, infer TRequest, unknown> ? TRequest : never

export type InferEndpointResponse<
  TEndpoint extends ApiEndpoint<HttpMethod, string, unknown, unknown>,
> = TEndpoint extends ApiEndpoint<HttpMethod, string, unknown, infer TResponse> ? TResponse : never

export type EndpointRequestConfig = Omit<RetryRequestConfig, 'url' | 'method' | 'params' | 'data'>

type EndpointCallOptions<TEndpoint extends ApiEndpoint<HttpMethod, string, unknown, unknown>> =
  InferEndpointRequest<TEndpoint> extends void
    ? {
        payload?: undefined
        config?: EndpointRequestConfig
      }
    : {
        payload: InferEndpointRequest<TEndpoint>
        config?: EndpointRequestConfig
      }

export function defineGetEndpoint<TPath extends string, TResponse, TQuery = void>(path: TPath) {
  return {
    method: 'get',
    path,
    request: undefined as TQuery,
    response: undefined as TResponse,
  } as const satisfies ApiEndpoint<'get', TPath, TQuery, TResponse>
}

export function definePostEndpoint<TPath extends string, TResponse, TBody = void>(path: TPath) {
  return {
    method: 'post',
    path,
    request: undefined as TBody,
    response: undefined as TResponse,
  } as const satisfies ApiEndpoint<'post', TPath, TBody, TResponse>
}

export function definePutEndpoint<TPath extends string, TResponse, TBody = void>(path: TPath) {
  return {
    method: 'put',
    path,
    request: undefined as TBody,
    response: undefined as TResponse,
  } as const satisfies ApiEndpoint<'put', TPath, TBody, TResponse>
}

export function defineDeleteEndpoint<TPath extends string, TResponse = void>(path: TPath) {
  return {
    method: 'delete',
    path,
    request: undefined as void,
    response: undefined as TResponse,
  } as const satisfies ApiEndpoint<'delete', TPath, void, TResponse>
}

export async function requestEndpoint<
  TEndpoint extends ApiEndpoint<HttpMethod, string, unknown, unknown>,
>(endpoint: TEndpoint, options?: EndpointCallOptions<TEndpoint>) {
  const payload = options?.payload as InferEndpointRequest<TEndpoint> | undefined
  const config = options?.config

  switch (endpoint.method) {
    case 'get':
      return get<InferEndpointResponse<TEndpoint>>(endpoint.path, {
        ...config,
        params: payload as Record<string, unknown> | undefined,
      })
    case 'delete':
      return del<InferEndpointResponse<TEndpoint>>(endpoint.path, {
        ...config,
        params: payload as Record<string, unknown> | undefined,
      })
    case 'post':
      return post<InferEndpointResponse<TEndpoint>, InferEndpointRequest<TEndpoint>>(
        endpoint.path,
        payload,
        config,
      )
    case 'put':
      return put<InferEndpointResponse<TEndpoint>, InferEndpointRequest<TEndpoint>>(
        endpoint.path,
        payload,
        config,
      )
    case 'patch':
      return patch<InferEndpointResponse<TEndpoint>, InferEndpointRequest<TEndpoint>>(
        endpoint.path,
        payload,
        config,
      )
    default:
      return Promise.reject(new Error(`Unsupported method: ${String(endpoint.method)}`))
  }
}
