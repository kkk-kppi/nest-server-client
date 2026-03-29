import type { UserRole } from './store/useAuthStore'

export interface AccessMeta {
  roles?: UserRole[]
  permissions?: string[]
}

export function canAccess(
  roles: UserRole[],
  permissions: string[],
  meta: AccessMeta | undefined,
) {
  if (!meta) {
    return true
  }

  const rolePass = !meta.roles?.length || meta.roles.some((role) => roles.includes(role))
  const permissionPass =
    !meta.permissions?.length || meta.permissions.every((item) => permissions.includes(item))

  return rolePass && permissionPass
}
