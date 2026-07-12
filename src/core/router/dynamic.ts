import type { Router } from 'vue-router'
import type { UserRole } from '@/features/auth/store/useAuthStore'
import { getDynamicRoutes } from './route-mode'
import {
  isDynamicRoutesInitialized,
  markDynamicRoutesInitialized,
  installDynamicRoutes,
  resetDynamicRoutes,
} from './registry'

export async function ensureDynamicRoutes(router: Router, roles: UserRole[]): Promise<boolean> {
  // Skip if already initialized with same roles
  if (isDynamicRoutesInitialized()) {
    return false
  }

  try {
    const dynamicRoutes = await getDynamicRoutes(roles)
    const installedCount = installDynamicRoutes(router, dynamicRoutes)

    if (installedCount > 0) {
      markDynamicRoutesInitialized(roles)
      return true
    }

    return false
  } catch (error) {
    console.error('[DynamicRoutes] Failed to ensure dynamic routes:', error)
    return false
  }
}

export function clearDynamicRoutes(router: Router): void {
  resetDynamicRoutes(router)
}
