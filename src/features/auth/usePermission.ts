import { computed } from 'vue'
import { useAuthStore } from './store/useAuthStore'
import type { UserRole } from './store/useAuthStore'
import { canAccess } from './permission'
import type { AccessMeta } from './permission'

export function usePermission() {
  const authStore = useAuthStore()

  const roles = computed(() => authStore.roles)
  const permissions = computed(() => authStore.permissions)

  function hasRole(requiredRoles: UserRole[]): boolean {
    return requiredRoles.some((role) => roles.value.includes(role))
  }

  function hasPermission(requiredPermissions: string[]): boolean {
    return requiredPermissions.every((perm) => permissions.value.includes(perm))
  }

  function canAccessMeta(meta: AccessMeta | undefined): boolean {
    return canAccess(roles.value, permissions.value, meta)
  }

  const canReadSystem = computed(() => hasPermission(['system:user:read']))
  const canCreateSystem = computed(() => hasPermission(['system:user:create']))
  const canUpdateSystem = computed(() => hasPermission(['system:user:update']))
  const canDeleteSystem = computed(() => hasPermission(['system:user:delete']))

  return {
    roles,
    permissions,
    hasRole,
    hasPermission,
    canAccess: canAccessMeta,
    canReadSystem,
    canCreateSystem,
    canUpdateSystem,
    canDeleteSystem,
  }
}
