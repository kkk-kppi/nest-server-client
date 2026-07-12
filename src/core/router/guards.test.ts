import { describe, expect, it } from 'vitest'
import { isPublicRoute, resolveDocumentTitle } from './guards'

describe('isPublicRoute', () => {
  it('returns true for explicit public route', () => {
    expect(isPublicRoute('login', { public: true })).toBe(true)
  })

  it('returns true for whitelisted route name', () => {
    expect(isPublicRoute('login', {})).toBe(true)
  })

  it('returns true for forbidden route', () => {
    expect(isPublicRoute('forbidden', {})).toBe(true)
  })

  it('returns true for not-found route', () => {
    expect(isPublicRoute('not-found', {})).toBe(true)
  })

  it('returns false for route without public declaration', () => {
    expect(isPublicRoute('workspace', {})).toBe(false)
  })

  it('returns false for route with requiresAuth but no public', () => {
    expect(isPublicRoute('dashboard', { requiresAuth: true })).toBe(false)
  })

  it('returns false for unknown route without meta', () => {
    expect(isPublicRoute('unknown', undefined)).toBe(false)
  })

  it('returns false for route with public: false', () => {
    expect(isPublicRoute('workspace', { public: false })).toBe(false)
  })

  it('returns true when public is true even if requiresAuth is true', () => {
    expect(isPublicRoute('special', { public: true, requiresAuth: true })).toBe(true)
  })
})

describe('resolveDocumentTitle', () => {
  it('returns route title when provided', () => {
    expect(resolveDocumentTitle('Admin')).toBe('Admin')
  })

  it('returns fallback title when missing', () => {
    expect(resolveDocumentTitle(undefined)).toBe('Nest Server Client')
  })

  it('returns fallback for non-string title', () => {
    expect(resolveDocumentTitle(123)).toBe('Nest Server Client')
  })
})
