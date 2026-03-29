import { post } from '@/core/http'
import { appEnv } from '@/core/config/env'
import type { UserRole } from './store/useAuthStore'

export interface LoginPayload {
  role: UserRole
}

export interface LoginResult {
  accessToken: string
  roles: UserRole[]
  permissions: string[]
}

const mockLoginMap: Record<UserRole, LoginResult> = {
  admin: {
    accessToken: 'admin-token',
    roles: ['admin'],
    permissions: ['workspace:read', 'admin:read'],
  },
  editor: {
    accessToken: 'editor-token',
    roles: ['editor'],
    permissions: ['workspace:read'],
  },
  viewer: {
    accessToken: 'viewer-token',
    roles: ['viewer'],
    permissions: ['workspace:read'],
  },
}

export async function loginByRole(payload: LoginPayload) {
  if (appEnv.mode !== 'production') {
    return Promise.resolve(mockLoginMap[payload.role])
  }

  return post<LoginResult, LoginPayload>('/api/auth/login-by-role', payload, {
    timeout: 8000,
  })
}
