import { describe, expect, it } from 'vitest'
import { canAccess } from './permission'

describe('canAccess', () => {
  it('returns true when no access meta', () => {
    expect(canAccess(['viewer'], ['workspace:read'], undefined)).toBe(true)
  })

  it('returns true when role and permission both match', () => {
    expect(
      canAccess(['admin'], ['workspace:read', 'admin:read'], {
        roles: ['admin'],
        permissions: ['admin:read'],
      }),
    ).toBe(true)
  })

  it('returns false when role mismatches', () => {
    expect(
      canAccess(['viewer'], ['workspace:read'], {
        roles: ['admin'],
      }),
    ).toBe(false)
  })

  it('returns false when permission mismatches', () => {
    expect(
      canAccess(['admin'], ['workspace:read'], {
        permissions: ['admin:write'],
      }),
    ).toBe(false)
  })
})
