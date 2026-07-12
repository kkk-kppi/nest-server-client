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

// Extract path parameters from a path string like '/api/users/:id'
type ExtractPathParams<TPath extends string> =
  TPath extends `${string}:${infer Param}/${infer Rest}`
    ? { [K in Param]: string } & ExtractPathParams<Rest>
    : TPath extends `${string}:${infer Param}`
      ? { [K in Param]: string }
      : Record<string, never>

// Structured endpoint call options
type StructuredEndpointCallOptions<
  TEndpoint extends ApiEndpoint<HttpMethod, string, unknown, unknown>,
> =
  TEndpoint extends ApiEndpoint<infer TMethod, infer TPath, infer TRequest, unknown>
    ? {
        pathParams?: ExtractPathParams<TPath>
        config?: EndpointRequestConfig
      } & (TMethod extends 'get' | 'delete'
        ? TRequest extends void
          ? { query?: undefined }
          : { query: TRequest }
        : TRequest extends void
          ? { body?: undefined }
          : { body: TRequest })
    : never

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

function resolvePathParams(path: string, pathParams?: Record<string, string>): string {
  // Check for path parameters in the path
  const pathParamMatches = path.match(/:(\w+)/g)
  if (!pathParamMatches) {
    return path
  }

  // If path has parameters but no pathParams provided, throw error
  if (!pathParams) {
    const paramName = pathParamMatches[0].slice(1) // Remove the colon
    throw new Error(`Missing path parameter "${paramName}" for path "${path}"`)
  }

  let resolvedPath = path
  for (const [key, value] of Object.entries(pathParams)) {
    const placeholder = `:${key}`
    if (!resolvedPath.includes(placeholder)) {
      throw new Error(`Path parameter "${key}" not found in path "${path}"`)
    }
    resolvedPath = resolvedPath.replace(placeholder, encodeURIComponent(value))
  }

  // Check for unresolved path parameters
  const unresolvedMatch = resolvedPath.match(/:(\w+)/)
  if (unresolvedMatch) {
    throw new Error(`Missing path parameter "${unresolvedMatch[1]}" for path "${path}"`)
  }

  return resolvedPath
}

export async function requestEndpoint<
  TEndpoint extends ApiEndpoint<HttpMethod, string, unknown, unknown>,
>(endpoint: TEndpoint, options?: StructuredEndpointCallOptions<TEndpoint>) {
  const config = options?.config
  const resolvedPath = resolvePathParams(
    endpoint.path,
    (options as { pathParams?: Record<string, string> })?.pathParams,
  )

  switch (endpoint.method) {
    case 'get':
      return get<InferEndpointResponse<TEndpoint>>(resolvedPath, {
        ...config,
        params: (options as { query?: Record<string, unknown> })?.query,
      })
    case 'delete':
      return del<InferEndpointResponse<TEndpoint>>(resolvedPath, {
        ...config,
        params: (options as { query?: Record<string, unknown> })?.query,
      })
    case 'post':
      return post<InferEndpointResponse<TEndpoint>, InferEndpointRequest<TEndpoint>>(
        resolvedPath,
        (options as { body?: InferEndpointRequest<TEndpoint> })?.body,
        config,
      )
    case 'put':
      return put<InferEndpointResponse<TEndpoint>, InferEndpointRequest<TEndpoint>>(
        resolvedPath,
        (options as { body?: InferEndpointRequest<TEndpoint> })?.body,
        config,
      )
    case 'patch':
      return patch<InferEndpointResponse<TEndpoint>, InferEndpointRequest<TEndpoint>>(
        resolvedPath,
        (options as { body?: InferEndpointRequest<TEndpoint> })?.body,
        config,
      )
    default:
      return Promise.reject(new Error(`Unsupported method: ${String(endpoint.method)}`))
  }
}
