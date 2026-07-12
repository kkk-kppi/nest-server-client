import {
  definePostEndpoint,
  defineGetEndpoint,
  requestEndpoint,
  type InferEndpointRequest,
  type InferEndpointResponse,
} from '@/core/http'
import type { UserRole } from './store/useAuthStore'

export const loginByRoleEndpoint = definePostEndpoint<
  '/api/auth/login-by-role',
  {
    accessToken: string
    roles: UserRole[]
    permissions: string[]
  },
  {
    role: UserRole
  }
>('/api/auth/login-by-role')

export type LoginPayload = InferEndpointRequest<typeof loginByRoleEndpoint>
export type LoginResult = InferEndpointResponse<typeof loginByRoleEndpoint>

export async function loginByRole(payload: LoginPayload) {
  return requestEndpoint(loginByRoleEndpoint, {
    body: payload,
    config: {
      timeout: 8000,
    },
  })
}

// 路由配置接口
export interface RouteConfig {
  path: string
  name?: string
  component?: string
  redirect?: string
  meta?: {
    title: string
    icon?: string
    hidden?: boolean
    order?: number
    requiresAuth?: boolean
    roles?: string[]
    permissions?: string[]
  }
  children?: RouteConfig[]
}

export const getRoutesEndpoint = defineGetEndpoint<'/api/auth/routes', RouteConfig[]>(
  '/api/auth/routes',
)

export async function getRoutes() {
  return requestEndpoint(getRoutesEndpoint, {
    config: {
      timeout: 8000,
    },
  })
}
