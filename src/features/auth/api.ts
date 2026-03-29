import {
  definePostEndpoint,
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
    payload,
    config: {
      timeout: 8000,
    },
  })
}
