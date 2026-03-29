import type { Router } from 'vue-router'
import { canAccess } from '@/features/auth/permission'
import { useAuthStore } from '@/features/auth/store/useAuthStore'
import { ensureDynamicRoutes } from './dynamic'

const AUTH_WHITELIST = new Set(['home', 'forbidden', 'not-found'])

export function isPublicRoute(routeName: string, requiresAuth: boolean | undefined) {
  const isWhitelisted = AUTH_WHITELIST.has(routeName)
  return !requiresAuth || isWhitelisted
}

export function resolveDocumentTitle(title: unknown) {
  return typeof title === 'string' ? title : 'Nest Server Client'
}

export function setupRouterGuards(router: Router) {
  router.beforeEach((to) => {
    const authStore = useAuthStore()

    if (authStore.isAuthenticated) {
      const hasAddedRoute = ensureDynamicRoutes(router, authStore.roles)
      if (to.name === 'not-found' && hasAddedRoute) {
        return to.fullPath
      }
    }

    const routeName = to.name ? String(to.name) : ''
    const isPublicPage = isPublicRoute(routeName, to.meta.requiresAuth)

    if (isPublicPage) {
      return true
    }

    if (!authStore.isAuthenticated) {
      return { name: 'home' }
    }

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
