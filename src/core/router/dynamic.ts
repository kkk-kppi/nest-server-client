import type { Router } from 'vue-router'
import { createDynamicRoutes } from '@/features/auth/dynamic-routes'
import type { UserRole } from '@/features/auth/store/useAuthStore'

export function ensureDynamicRoutes(router: Router, roles: UserRole[]) {
  const dynamicRoutes = createDynamicRoutes(roles)
  let added = false

  dynamicRoutes.forEach((route) => {
    if (!route.name) {
      return
    }

    const routeName = String(route.name)
    if (!router.hasRoute(routeName)) {
      router.addRoute(route)
      added = true
    }
  })

  return added
}
