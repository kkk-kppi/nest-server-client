import type { Router, RouteRecordRaw } from 'vue-router'

export type RouteRemover = () => void

export interface DynamicRouteState {
  initialized: boolean
  roles: string[]
  installedRoutes: Map<string, RouteRemover>
}

const state: DynamicRouteState = {
  initialized: false,
  roles: [],
  installedRoutes: new Map(),
}

export function getDynamicRouteState(): Readonly<DynamicRouteState> {
  return {
    initialized: state.initialized,
    roles: [...state.roles],
    installedRoutes: new Map(state.installedRoutes),
  }
}

export function isDynamicRoutesInitialized(): boolean {
  return state.initialized
}

export function markDynamicRoutesInitialized(roles: string[]): void {
  state.initialized = true
  state.roles = [...roles]
}

export function registerDynamicRoute(name: string, remover: RouteRemover): void {
  // If already registered, remove the old one first
  const existingRemover = state.installedRoutes.get(name)
  if (existingRemover) {
    existingRemover()
  }
  state.installedRoutes.set(name, remover)
}

export function removeDynamicRoute(name: string): boolean {
  const remover = state.installedRoutes.get(name)
  if (remover) {
    remover()
    state.installedRoutes.delete(name)
    return true
  }
  return false
}

export function resetDynamicRoutes(router: Router): void {
  void router // Reserved for future use
  // Remove all installed dynamic routes
  for (const [name, remover] of state.installedRoutes) {
    try {
      remover()
    } catch (error) {
      console.warn(`[RouteRegistry] Failed to remove route ${name}:`, error)
    }
  }

  // Clear state
  state.installedRoutes.clear()
  state.initialized = false
  state.roles = []
}

export function installDynamicRoute(router: Router, route: RouteRecordRaw): boolean {
  if (!route.name) {
    console.warn('[RouteRegistry] Cannot install route without name')
    return false
  }

  const routeName = String(route.name)

  // Skip if already installed
  if (router.hasRoute(routeName)) {
    return false
  }

  try {
    const removeFn = router.addRoute(route)
    registerDynamicRoute(routeName, removeFn)
    return true
  } catch (error) {
    console.error(`[RouteRegistry] Failed to install route ${routeName}:`, error)
    return false
  }
}

export function installDynamicRoutes(router: Router, routes: RouteRecordRaw[]): number {
  let installedCount = 0

  for (const route of routes) {
    if (route.name) {
      const routeName = String(route.name)
      if (!router.hasRoute(routeName)) {
        if (installDynamicRoute(router, route)) {
          installedCount++
        }
      }
    } else if (route.children?.length) {
      // For parent routes without name, install children
      const childNeedsInstall = route.children.some(
        (child) => child.name && !router.hasRoute(String(child.name)),
      )
      if (childNeedsInstall) {
        try {
          const removeFn = router.addRoute(route)
          const parentKey = `__parent_${route.path}`
          registerDynamicRoute(parentKey, removeFn)
          installedCount++
        } catch (error) {
          console.error(`[RouteRegistry] Failed to install route group ${route.path}:`, error)
        }
      }
    }
  }

  return installedCount
}
