import type { Router } from 'vue-router'
import { canAccess } from '@/features/auth/permission'
import { useAuthStore } from '@/features/auth/store/useAuthStore'
import { ensureDynamicRoutes } from './dynamic'

// Explicit public routes - these are accessible without authentication
const EXPLICIT_PUBLIC_ROUTES = new Set(['login', 'forbidden', 'not-found'])

export function isPublicRoute(
  routeName: string,
  meta: { public?: boolean; requiresAuth?: boolean } | undefined,
): boolean {
  // Explicit public declaration takes precedence
  if (meta?.public === true) {
    return true
  }

  // Legacy whitelist for backward compatibility
  if (EXPLICIT_PUBLIC_ROUTES.has(routeName)) {
    return true
  }

  // Fail-closed: if not explicitly public, require auth
  return false
}

export function resolveDocumentTitle(title: unknown) {
  return typeof title === 'string' ? title : 'Nest Server Client'
}

export function setupRouterGuards(router: Router) {
  router.beforeEach(async (to) => {
    const authStore = useAuthStore()

    if (authStore.isAuthenticated) {
      const hasAddedRoute = await ensureDynamicRoutes(router, authStore.roles)
      if (to.name === 'not-found' && hasAddedRoute) {
        return to.fullPath
      }
    }

    const routeName = to.name ? String(to.name) : ''
    const isPublicPage = isPublicRoute(routeName, to.meta)

    // Public routes are accessible to everyone
    if (isPublicPage) {
      return true
    }

    // Fail-closed: require authentication for all non-public routes
    if (!authStore.isAuthenticated) {
      return { name: 'login' }
    }

    // Check role/permission access
    const pass = canAccess(authStore.roles, authStore.permissions, to.meta)
    if (!pass) {
      return { name: 'forbidden' }
    }

    return true
  })

  router.afterEach((to) => {
    const title = resolveDocumentTitle(to.meta.title)
    if (typeof document !== 'undefined') {
      document.title = title
    }
  })
}
