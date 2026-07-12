import { describe, it, expect, vi, beforeEach } from 'vitest'
import type { RouteConfig } from '@/features/auth/api'

const { getRoutesMock } = vi.hoisted(() => ({
  getRoutesMock: vi.fn(),
}))

vi.mock('@/features/auth/api', () => ({
  getRoutes: getRoutesMock,
}))

vi.mock('@/core/config/env', () => ({
  appEnv: {
    routeMode: 'backend',
  },
}))

describe('route-mode', () => {
  beforeEach(() => {
    getRoutesMock.mockReset()
  })

  describe('convertRouteConfig', () => {
    it('should convert valid route config', async () => {
      const { getAllRoutes } = await import('./route-mode')

      const routeConfigs: RouteConfig[] = [
        {
          path: '/admin',
          name: 'Admin',
          component: 'AdminLayout',
          meta: { title: 'Admin' },
          children: [
            {
              path: 'dashboard',
              name: 'Dashboard',
              component: 'DashboardView',
              meta: { title: 'Dashboard' },
            },
          ],
        },
      ]

      getRoutesMock.mockResolvedValueOnce(routeConfigs)

      const routes = await getAllRoutes(['admin'])

      // Should include static routes + dynamic routes
      expect(routes.length).toBeGreaterThan(0)

      // Find the admin route
      const adminRoute = routes.find((r) => r.path === '/admin')
      expect(adminRoute).toBeDefined()
      expect(adminRoute?.name).toBe('Admin')
    })

    it('should reject unknown component', async () => {
      const { getAllRoutes } = await import('./route-mode')

      const routeConfigs: RouteConfig[] = [
        {
          path: '/unknown',
          name: 'Unknown',
          component: 'NonExistentComponent',
          meta: { title: 'Unknown' },
        },
      ]

      getRoutesMock.mockResolvedValueOnce(routeConfigs)

      // Should throw error for unknown component
      await expect(getAllRoutes(['admin'])).rejects.toThrow('Unknown component')
    })

    it('should reject duplicate route names', async () => {
      const { getAllRoutes } = await import('./route-mode')

      const routeConfigs: RouteConfig[] = [
        {
          path: '/admin',
          name: 'Admin',
          component: 'AdminLayout',
          meta: { title: 'Admin' },
        },
        {
          path: '/admin2',
          name: 'Admin', // Duplicate name
          component: 'AdminLayout',
          meta: { title: 'Admin 2' },
        },
      ]

      getRoutesMock.mockResolvedValueOnce(routeConfigs)

      // Should throw error for duplicate route name
      await expect(getAllRoutes(['admin'])).rejects.toThrow('Duplicate route name')
    })

    it('should reject invalid path', async () => {
      const { getAllRoutes } = await import('./route-mode')

      const routeConfigs: RouteConfig[] = [
        {
          path: '', // Empty path
          name: 'Empty',
          component: 'AdminLayout',
          meta: { title: 'Empty' },
        },
      ]

      getRoutesMock.mockResolvedValueOnce(routeConfigs)

      // Should throw error for invalid path
      await expect(getAllRoutes(['admin'])).rejects.toThrow('Invalid route path')
    })

    it('should handle API failure gracefully', async () => {
      const { getAllRoutes } = await import('./route-mode')

      getRoutesMock.mockRejectedValueOnce(new Error('Network error'))

      // Should throw error instead of returning empty array
      await expect(getAllRoutes(['admin'])).rejects.toThrow('Network error')
    })
  })
})
