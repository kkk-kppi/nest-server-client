import { describe, it, expect } from 'vitest'
import { parseRuntimeConfig } from './runtime-config'

describe('parseRuntimeConfig', () => {
  const validConfig = {
    apiBaseUrl: 'https://api.example.com',
    enableMock: false,
    routeMode: 'frontend' as const,
    environment: 'production' as const,
    release: '1.0.0',
  }

  it('accepts valid configuration', () => {
    const result = parseRuntimeConfig(validConfig)
    expect(result.apiBaseUrl).toBe('https://api.example.com')
    expect(result.enableMock).toBe(false)
    expect(result.routeMode).toBe('frontend')
    expect(result.environment).toBe('production')
    expect(result.release).toBe('1.0.0')
  })

  it('rejects missing apiBaseUrl', () => {
    expect(() => parseRuntimeConfig({ ...validConfig, apiBaseUrl: '' })).toThrow(/apiBaseUrl/)
  })

  it('rejects undefined apiBaseUrl', () => {
    expect(() => parseRuntimeConfig({ ...validConfig, apiBaseUrl: undefined })).toThrow(
      /apiBaseUrl/,
    )
  })

  it('rejects invalid URL for apiBaseUrl', () => {
    expect(() => parseRuntimeConfig({ ...validConfig, apiBaseUrl: 'not-a-url' })).toThrow(
      /valid URL/,
    )
  })

  it('rejects mock mode in production', () => {
    expect(() =>
      parseRuntimeConfig({
        ...validConfig,
        enableMock: true,
        environment: 'production',
      }),
    ).toThrow(/enableMock/)
  })

  it('allows mock mode in development', () => {
    const result = parseRuntimeConfig({
      ...validConfig,
      enableMock: true,
      environment: 'development',
    })
    expect(result.enableMock).toBe(true)
  })

  it('rejects invalid routeMode', () => {
    expect(() =>
      parseRuntimeConfig({
        ...validConfig,
        routeMode: 'invalid' as unknown,
      }),
    ).toThrow(/routeMode/)
  })

  it('defaults routeMode to frontend when not provided', () => {
    const result = parseRuntimeConfig({
      ...validConfig,
      routeMode: undefined,
    })
    expect(result.routeMode).toBe('frontend')
  })

  it('accepts backend routeMode', () => {
    const result = parseRuntimeConfig({
      ...validConfig,
      routeMode: 'backend',
    })
    expect(result.routeMode).toBe('backend')
  })

  it('defaults environment based on mode parameter', () => {
    const result = parseRuntimeConfig({ ...validConfig, environment: undefined }, 'production')
    expect(result.environment).toBe('production')
  })

  it('defaults environment to development when mode is not production', () => {
    const result = parseRuntimeConfig({ ...validConfig, environment: undefined }, 'development')
    expect(result.environment).toBe('development')
  })

  it('handles boolean enableMock from string', () => {
    const result = parseRuntimeConfig({
      ...validConfig,
      enableMock: 'false' as unknown,
      environment: 'development',
    })
    expect(result.enableMock).toBe(false)
  })

  it('defaults sentryDsn to empty string', () => {
    const result = parseRuntimeConfig({
      ...validConfig,
      sentryDsn: undefined,
    })
    expect(result.sentryDsn).toBe('')
  })

  it('defaults release to empty string', () => {
    const result = parseRuntimeConfig({
      ...validConfig,
      release: undefined,
    })
    expect(result.release).toBe('')
  })

  it('accepts http URL for development', () => {
    const result = parseRuntimeConfig({
      ...validConfig,
      apiBaseUrl: 'http://localhost:3000',
    })
    expect(result.apiBaseUrl).toBe('http://localhost:3000')
  })
})
