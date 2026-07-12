import { describe, it, expect, beforeEach, vi } from 'vitest'
import type { Router } from 'vue-router'
import {
  getDynamicRouteState,
  isDynamicRoutesInitialized,
  markDynamicRoutesInitialized,
  registerDynamicRoute,
  removeDynamicRoute,
  resetDynamicRoutes,
  installDynamicRoute,
  installDynamicRoutes,
} from './registry'

// Mock router
function createMockRouter() {
  const routes = new Map<string, () => void>()
  return {
    hasRoute: vi.fn((name: string) => routes.has(name)),
    addRoute: vi.fn((route: { name?: string }) => {
      const name = route.name || `__unnamed_${routes.size}`
      const removeFn = vi.fn(() => {
        routes.delete(name)
      })
      routes.set(name, removeFn)
      return removeFn
    }),
    removeRoute: vi.fn((name: string) => {
      routes.delete(name)
    }),
    getRoutes: vi.fn(() => Array.from(routes.keys()).map((name) => ({ name }))),
  } as unknown as Router
}

describe('Route Registry', () => {
  beforeEach(() => {
    // Reset state before each test
    resetDynamicRoutes(createMockRouter())
  })

  describe('getDynamicRouteState', () => {
    it('returns initial state', () => {
      const state = getDynamicRouteState()
      expect(state.initialized).toBe(false)
      expect(state.roles).toEqual([])
      expect(state.installedRoutes.size).toBe(0)
    })

    it('returns a copy of state', () => {
      const state1 = getDynamicRouteState()
      const state2 = getDynamicRouteState()
      expect(state1).not.toBe(state2)
      expect(state1.roles).not.toBe(state2.roles)
    })
  })

  describe('isDynamicRoutesInitialized', () => {
    it('returns false initially', () => {
      expect(isDynamicRoutesInitialized()).toBe(false)
    })

    it('returns true after marking initialized', () => {
      markDynamicRoutesInitialized(['admin'])
      expect(isDynamicRoutesInitialized()).toBe(true)
    })
  })

  describe('markDynamicRoutesInitialized', () => {
    it('sets initialized state and roles', () => {
      markDynamicRoutesInitialized(['admin', 'editor'])
      const state = getDynamicRouteState()
      expect(state.initialized).toBe(true)
      expect(state.roles).toEqual(['admin', 'editor'])
    })

    it('creates a copy of roles array', () => {
      const roles = ['admin']
      markDynamicRoutesInitialized(roles)
      const state = getDynamicRouteState()
      expect(state.roles).not.toBe(roles)
    })
  })

  describe('registerDynamicRoute', () => {
    it('registers a route remover', () => {
      const remover = vi.fn()
      registerDynamicRoute('test', remover)
      const state = getDynamicRouteState()
      expect(state.installedRoutes.has('test')).toBe(true)
    })

    it('replaces existing remover when registering same name', () => {
      const remover1 = vi.fn()
      const remover2 = vi.fn()
      registerDynamicRoute('test', remover1)
      registerDynamicRoute('test', remover2)
      expect(remover1).toHaveBeenCalled()
      const state = getDynamicRouteState()
      expect(state.installedRoutes.get('test')).toBe(remover2)
    })
  })

  describe('removeDynamicRoute', () => {
    it('removes and calls remover for existing route', () => {
      const remover = vi.fn()
      registerDynamicRoute('test', remover)
      const result = removeDynamicRoute('test')
      expect(result).toBe(true)
      expect(remover).toHaveBeenCalled()
      const state = getDynamicRouteState()
      expect(state.installedRoutes.has('test')).toBe(false)
    })

    it('returns false for non-existing route', () => {
      const result = removeDynamicRoute('nonexistent')
      expect(result).toBe(false)
    })
  })

  describe('resetDynamicRoutes', () => {
    it('removes all registered routes', () => {
      const router = createMockRouter()
      const remover1 = vi.fn()
      const remover2 = vi.fn()
      registerDynamicRoute('route1', remover1)
      registerDynamicRoute('route2', remover2)

      resetDynamicRoutes(router)

      expect(remover1).toHaveBeenCalled()
      expect(remover2).toHaveBeenCalled()
      const state = getDynamicRouteState()
      expect(state.installedRoutes.size).toBe(0)
      expect(state.initialized).toBe(false)
      expect(state.roles).toEqual([])
    })

    it('handles errors when removing routes', () => {
      const router = createMockRouter()
      const errorRemover = vi.fn(() => {
        throw new Error('Remove failed')
      })
      const normalRemover = vi.fn()
      registerDynamicRoute('error-route', errorRemover)
      registerDynamicRoute('normal-route', normalRemover)

      // Should not throw
      resetDynamicRoutes(router)

      expect(normalRemover).toHaveBeenCalled()
      const state = getDynamicRouteState()
      expect(state.installedRoutes.size).toBe(0)
    })
  })

  describe('installDynamicRoute', () => {
    it('installs a route with name', () => {
      const router = createMockRouter()
      const route = { name: 'test', path: '/test', component: {} }

      const result = installDynamicRoute(router, route)

      expect(result).toBe(true)
      const state = getDynamicRouteState()
      expect(state.installedRoutes.has('test')).toBe(true)
    })

    it('skips installation if route already exists', () => {
      const router = createMockRouter()
      vi.mocked(router.hasRoute).mockReturnValue(true)
      const route = { name: 'test', path: '/test', component: {} }

      const result = installDynamicRoute(router, route)

      expect(result).toBe(false)
    })

    it('returns false for route without name', () => {
      const router = createMockRouter()
      const route = { path: '/test', component: {} }

      const result = installDynamicRoute(router, route)

      expect(result).toBe(false)
    })
  })

  describe('installDynamicRoutes', () => {
    it('installs multiple routes', () => {
      const router = createMockRouter()
      const routes = [
        { name: 'route1', path: '/route1', component: {} },
        { name: 'route2', path: '/route2', component: {} },
      ]

      const count = installDynamicRoutes(router, routes)

      expect(count).toBe(2)
    })

    it('installs parent route with children', () => {
      const router = createMockRouter()
      const routes = [
        {
          path: '/parent',
          component: {},
          children: [
            { name: 'child1', path: '/parent/child1', component: {} },
            { name: 'child2', path: '/parent/child2', component: {} },
          ],
        },
      ]

      const count = installDynamicRoutes(router, routes)

      expect(count).toBe(1)
    })

    it('skips routes that already exist', () => {
      const router = createMockRouter()
      vi.mocked(router.hasRoute).mockImplementation(
        (name: string | symbol | number | null | undefined) => name === 'existing',
      )
      const routes = [
        { name: 'existing', path: '/existing', component: {} },
        { name: 'new', path: '/new', component: {} },
      ]

      const count = installDynamicRoutes(router, routes)

      expect(count).toBe(1)
    })
  })
})
