import { describe, expect, it, vi, beforeEach } from 'vitest'
import type { App } from 'vue'
import type { Router } from 'vue-router'

vi.mock('@/core/config/env', () => ({
  appEnv: { sentryDsn: '', mode: 'test', apiBaseUrl: '', enableMock: false },
}))

describe('initObservability', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('skips init when DSN is empty', async () => {
    const consoleSpy = vi.spyOn(console, 'info').mockImplementation(() => {})
    const { initObservability } = await import('./index')

    const mockApp = {} as App
    const mockRouter = {} as Router

    await initObservability(mockApp, mockRouter)

    expect(consoleSpy).toHaveBeenCalledWith(
      '[Observability] Sentry DSN not configured, skipping initialization',
    )
    consoleSpy.mockRestore()
  })
})
