import { describe, expect, it } from 'vitest'
import { ensureDynamicRoutes } from './dynamic'

function createRouterStub(existingNames: string[] = []) {
  const names = new Set(existingNames)
  const added: string[] = []

  return {
    hasRoute(name: string) {
      return names.has(name)
    },
    addRoute(route: { name?: string | symbol | null }) {
      const routeName = route.name ? String(route.name) : ''
      names.add(routeName)
      added.push(routeName)
    },
    added,
  }
}

describe('ensureDynamicRoutes', () => {
  it('adds workspace and admin routes for admin role', async () => {
    const router = createRouterStub()
    const added = await ensureDynamicRoutes(router as never, ['admin'])
    expect(added).toBe(true)
    expect(router.added.length).toBeGreaterThanOrEqual(2)
  })

  it('does not add existing routes repeatedly', async () => {
    const router = createRouterStub(['workspace'])
    const added = await ensureDynamicRoutes(router as never, ['editor'])
    expect(added).toBe(false)
    expect(router.added).toHaveLength(0)
  })
})
