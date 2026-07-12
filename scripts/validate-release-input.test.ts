import { describe, it, expect } from 'vitest'
import { validateReleaseInput } from './validate-release-input.mjs'

describe('validateReleaseInput', () => {
  describe('valid inputs', () => {
    it('accepts semver without prefix', () => {
      const result = validateReleaseInput('1.0.0')
      expect(result.valid).toBe(true)
      expect(result.type).toBe('semver')
    })

    it('accepts semver with v prefix', () => {
      const result = validateReleaseInput('v1.0.0')
      expect(result.valid).toBe(true)
      expect(result.type).toBe('semver')
    })

    it('accepts semver with prerelease', () => {
      const result = validateReleaseInput('1.0.0-beta.1')
      expect(result.valid).toBe(true)
      expect(result.type).toBe('semver')
    })

    it('accepts semver with build metadata', () => {
      const result = validateReleaseInput('1.0.0+build.123')
      expect(result.valid).toBe(true)
      expect(result.type).toBe('semver')
    })

    it('accepts release ID', () => {
      const result = validateReleaseInput('12345')
      expect(result.valid).toBe(true)
      expect(result.type).toBe('release-id')
    })

    it('accepts sha256 digest', () => {
      const digest = 'sha256:' + 'a'.repeat(64)
      const result = validateReleaseInput(digest)
      expect(result.valid).toBe(true)
      expect(result.type).toBe('sha256')
    })

    it('accepts sha256 with mixed case hex', () => {
      const digest = 'sha256:' + 'abcdef0123456789'.repeat(4)
      const result = validateReleaseInput(digest)
      expect(result.valid).toBe(true)
      expect(result.type).toBe('sha256')
    })
  })

  describe('invalid inputs', () => {
    it('rejects empty string', () => {
      const result = validateReleaseInput('')
      expect(result.valid).toBe(false)
      expect(result.error).toMatch(/required/)
    })

    it('rejects null', () => {
      const result = validateReleaseInput(null)
      expect(result.valid).toBe(false)
    })

    it('rejects undefined', () => {
      const result = validateReleaseInput(undefined)
      expect(result.valid).toBe(false)
    })

    it('rejects whitespace only', () => {
      const result = validateReleaseInput('   ')
      expect(result.valid).toBe(false)
    })

    it('rejects leading whitespace', () => {
      const result = validateReleaseInput(' 1.0.0')
      expect(result.valid).toBe(false)
    })

    it('rejects trailing whitespace', () => {
      const result = validateReleaseInput('1.0.0 ')
      expect(result.valid).toBe(false)
    })

    it('rejects semicolons', () => {
      const result = validateReleaseInput('1.0.0;rm -rf /')
      expect(result.valid).toBe(false)
    })

    it('rejects backticks', () => {
      const result = validateReleaseInput('`whoami`')
      expect(result.valid).toBe(false)
    })

    it('rejects command substitution with $()', () => {
      const result = validateReleaseInput('$(whoami)')
      expect(result.valid).toBe(false)
    })

    it('rejects pipe', () => {
      const result = validateReleaseInput('1.0.0|cat /etc/passwd')
      expect(result.valid).toBe(false)
    })

    it('rejects ampersand', () => {
      const result = validateReleaseInput('1.0.0&bg')
      expect(result.valid).toBe(false)
    })

    it('rejects path traversal', () => {
      const result = validateReleaseInput('../etc/passwd')
      expect(result.valid).toBe(false)
    })

    it('rejects double dash', () => {
      const result = validateReleaseInput('--help')
      expect(result.valid).toBe(false)
    })

    it('rejects invalid sha256 length', () => {
      const result = validateReleaseInput('sha256:abc123')
      expect(result.valid).toBe(false)
    })

    it('rejects sha256 with invalid characters', () => {
      const result = validateReleaseInput('sha256:' + 'g'.repeat(64))
      expect(result.valid).toBe(false)
    })

    it('rejects random string', () => {
      const result = validateReleaseInput('not-a-valid-release')
      expect(result.valid).toBe(false)
    })
  })
})
