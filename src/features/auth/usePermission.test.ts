import { describe, it, expect, vi, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { usePermission } from './usePermission'

vi.mock('./store/useAuthStore', () => ({
  useAuthStore: vi.fn(() => ({
    roles: ['admin'],
    permissions: ['system:user:read', 'system:user:create', 'system:user:update'],
  })),
}))

describe('usePermission', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('returns true when roles match any', () => {
    const { hasRole } = usePermission()
    expect(hasRole(['admin', 'viewer'])).toBe(true)
  })

  it('returns false when no roles match', () => {
    const { hasRole } = usePermission()
    expect(hasRole(['editor'])).toBe(false)
  })

  it('returns true when all permissions match', () => {
    const { hasPermission } = usePermission()
    expect(hasPermission(['system:user:read', 'system:user:create'])).toBe(true)
  })

  it('returns false when some permissions missing', () => {
    const { hasPermission } = usePermission()
    expect(hasPermission(['system:user:read', 'system:user:delete'])).toBe(false)
  })

  it('returns true for empty requirements', () => {
    const { canAccess } = usePermission()
    expect(canAccess({})).toBe(true)
  })

  it('returns true for undefined meta', () => {
    const { canAccess } = usePermission()
    expect(canAccess(undefined)).toBe(true)
  })

  it('provides system permission computed', () => {
    const { canReadSystem, canCreateSystem, canUpdateSystem, canDeleteSystem } = usePermission()
    expect(canReadSystem.value).toBe(true)
    expect(canCreateSystem.value).toBe(true)
    expect(canUpdateSystem.value).toBe(true)
    expect(canDeleteSystem.value).toBe(false)
  })
})
