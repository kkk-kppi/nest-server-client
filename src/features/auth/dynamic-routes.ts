import type { RouteRecordRaw } from 'vue-router'
import type { UserRole } from './store/useAuthStore'
import { workspaceRoutes } from '@/features/workspace/routes'
import { adminRoutes } from '@/features/admin/routes'
import { systemRoutes } from '@/features/system/routes'

const ROLE_ROUTE_MAP: Record<UserRole, RouteRecordRaw[]> = {
  admin: [...workspaceRoutes, ...adminRoutes, ...systemRoutes],
  editor: [...workspaceRoutes],
  viewer: [...workspaceRoutes],
}

export function createDynamicRoutes(roles: UserRole[]) {
  const routeMap = new Map<string, RouteRecordRaw>()
  const anonymousRoutes: RouteRecordRaw[] = []

  roles.forEach((role) => {
    const roleRoutes = ROLE_ROUTE_MAP[role] ?? []
    roleRoutes.forEach((route) => {
      if (route.name) {
        if (!routeMap.has(String(route.name))) {
          routeMap.set(String(route.name), route)
        }
      } else {
        if (!anonymousRoutes.some((r) => r.path === route.path)) {
          anonymousRoutes.push(route)
        }
      }
    })
  })

  return [...anonymousRoutes, ...Array.from(routeMap.values())]
}
