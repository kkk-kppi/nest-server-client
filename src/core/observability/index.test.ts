import { describe, expect, it, vi, beforeEach } from 'vitest'
import type { App } from 'vue'
import type { Router } from 'vue-router'
import type { TelemetryAdapter } from './telemetry'

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

describe('telemetry', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should capture exception to console when no adapter', async () => {
    const { captureException } = await import('./telemetry')
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

    const error = new Error('Test error')
    captureException(error)

    expect(consoleSpy).toHaveBeenCalledWith('[Telemetry] Unhandled exception:', error, undefined)
    consoleSpy.mockRestore()
  })

  it('should capture message to console when no adapter', async () => {
    const { captureMessage } = await import('./telemetry')
    const consoleSpy = vi.spyOn(console, 'info').mockImplementation(() => {})

    captureMessage('Test message')

    expect(consoleSpy).toHaveBeenCalledWith('[Telemetry] Message:', 'Test message', undefined)
    consoleSpy.mockRestore()
  })

  it('should deduplicate same error instance', async () => {
    const { captureException } = await import('./telemetry')
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

    const error = new Error('Duplicate error')
    captureException(error)
    captureException(error) // Should not be called again

    expect(consoleSpy).toHaveBeenCalledTimes(1)
    consoleSpy.mockRestore()
  })

  it('should use custom adapter when set', async () => {
    const { captureException, setTelemetryAdapter } = await import('./telemetry')
    const mockAdapter = {
      captureException: vi.fn(),
      captureMessage: vi.fn(),
      setUser: vi.fn(),
      addBreadcrumb: vi.fn(),
      reportMetric: vi.fn(),
    }

    setTelemetryAdapter(mockAdapter)

    const error = new Error('Adapter error')
    captureException(error)

    expect(mockAdapter.captureException).toHaveBeenCalledWith(error, undefined)

    // Reset adapter
    setTelemetryAdapter(null as unknown as TelemetryAdapter)
  })
})
