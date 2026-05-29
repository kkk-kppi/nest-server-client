import type { Router } from 'vue-router'
import type { UserRole } from '@/features/auth/store/useAuthStore'
import { getDynamicRoutes } from './route-mode'

export async function ensureDynamicRoutes(router: Router, roles: UserRole[]) {
  const dynamicRoutes = await getDynamicRoutes(roles)
  let added = false

  dynamicRoutes.forEach((route) => {
    if (route.name) {
      const routeName = String(route.name)
      if (!router.hasRoute(routeName)) {
        router.addRoute(route)
        added = true
      }
      return
    }

    const childNeedsAdd = (route.children || []).some(
      (child) => child.name && !router.hasRoute(String(child.name)),
    )
    if (childNeedsAdd) {
      router.addRoute(route)
      added = true
    }
  })

  return added
}
