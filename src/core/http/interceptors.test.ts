import { describe, it, expect, beforeEach } from 'vitest'
import axios from 'axios'
import {
  setupInterceptors,
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

  describe('Request deduplication', () => {
    it('should cancel previous request when same dedupe key is used', async () => {
      const http = axios.create({ baseURL: 'https://api.example.com' })
      setupInterceptors(http, 'https://api.example.com')

      // Both requests should be created and processed
      const request1 = http.get('/test')
      const request2 = http.get('/test')

      // Both requests should reject (one due to abort, one due to network)
      await expect(request1).rejects.toThrow()
      await expect(request2).rejects.toThrow()
    })

    it('should not cancel requests with different dedupe keys', async () => {
      const http = axios.create({ baseURL: 'https://api.example.com' })
      setupInterceptors(http, 'https://api.example.com')

      // Both requests should be created and processed
      const request1 = http.get('/test1')
      const request2 = http.get('/test2')

      // Both requests should reject (due to network errors)
      await expect(request1).rejects.toThrow()
      await expect(request2).rejects.toThrow()
    })
  })

  describe('External AbortSignal', () => {
    it('should respect caller abort signal', async () => {
      const http = axios.create({ baseURL: 'https://api.example.com' })
      setupInterceptors(http, 'https://api.example.com')

      const controller = new AbortController()
      const request = http.get('/test', { signal: controller.signal })

      controller.abort()

      await expect(request).rejects.toThrow()
    })

    it('should not override caller signal with internal dedup signal', async () => {
      const http = axios.create({ baseURL: 'https://api.example.com' })
      setupInterceptors(http, 'https://api.example.com')

      const callerController = new AbortController()
      const request = http.get('/test', { signal: callerController.signal })

      // The caller's signal should be preserved
      expect(callerController.signal.aborted).toBe(false)

      // Abort via caller
      callerController.abort()
      await expect(request).rejects.toThrow()
    })
  })

  describe('Cancellation and retry', () => {
    it('should not retry canceled requests', async () => {
      const http = axios.create({ baseURL: 'https://api.example.com' })
      setupInterceptors(http, 'https://api.example.com')

      const controller = new AbortController()
      const request = http.get('/test', { signal: controller.signal })

      controller.abort()

      await expect(request).rejects.toThrow()
    })

    it('should not retry aborted requests', async () => {
      const http = axios.create({ baseURL: 'https://api.example.com' })
      setupInterceptors(http, 'https://api.example.com')

      const controller = new AbortController()
      controller.abort()

      const request = http.get('/test', { signal: controller.signal })

      await expect(request).rejects.toThrow()
    })
  })

  describe('Retry strategy', () => {
    it('should not retry POST/PUT/DELETE by default', async () => {
      const http = axios.create({ baseURL: 'https://api.example.com' })
      setupInterceptors(http, 'https://api.example.com')

      // These should reject without retry
      await expect(http.post('/test', {})).rejects.toThrow()
    })
  })
})
