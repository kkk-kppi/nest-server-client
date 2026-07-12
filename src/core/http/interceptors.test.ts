import { describe, it, beforeEach } from 'vitest'
import {
  setAccessTokenGetter,
  setUnauthorizedHandler,
  addAllowedOrigin,
  clearAllowedOrigins,
} from './interceptors'

describe('HTTP Interceptors', () => {
  beforeEach(() => {
    clearAllowedOrigins()
    setAccessTokenGetter(() => '')
    setUnauthorizedHandler(() => {})
  })

  describe('Origin management', () => {
    it('should add and clear allowed origins without errors', () => {
      addAllowedOrigin('https://other.example.com')
      addAllowedOrigin('https://api.example.com')
      clearAllowedOrigins()
    })

    it('should accept multiple origins', () => {
      addAllowedOrigin('https://api1.example.com')
      addAllowedOrigin('https://api2.example.com')
      addAllowedOrigin('https://api3.example.com')
      // Should not throw
    })
  })

  describe('Token getter setup', () => {
    it('should accept token getter function', () => {
      const getter = () => 'test-token'
      setAccessTokenGetter(getter)
      // Should not throw
    })

    it('should accept empty getter', () => {
      setAccessTokenGetter(() => '')
      // Should not throw
    })
  })

  describe('Unauthorized handler setup', () => {
    it('should accept handler function', () => {
      const handler = () => {}
      setUnauthorizedHandler(handler)
      // Should not throw
    })

    it('should accept empty handler', () => {
      setUnauthorizedHandler(() => {})
      // Should not throw
    })
  })
})
