import { describe, expect, it } from 'vitest'
import { isPublicRoute, resolveDocumentTitle } from './guards'

describe('isPublicRoute', () => {
  it('returns true for whitelist route', () => {
    expect(isPublicRoute('home', true)).toBe(true)
  })

  it('returns true for route without requiresAuth', () => {
    expect(isPublicRoute('workspace', undefined)).toBe(true)
  })

  it('returns false for protected non-whitelist route', () => {
    expect(isPublicRoute('workspace', true)).toBe(false)
  })
})

describe('resolveDocumentTitle', () => {
  it('returns route title when provided', () => {
    expect(resolveDocumentTitle('Admin')).toBe('Admin')
  })

  it('returns fallback title when missing', () => {
    expect(resolveDocumentTitle(undefined)).toBe('Nest Server Client')
  })
})
