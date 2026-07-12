export interface RuntimeConfig {
  apiBaseUrl: string
  sentryDsn: string
  enableMock: boolean
  routeMode: 'frontend' | 'backend'
  environment: 'development' | 'test' | 'stage' | 'production'
  release: string
}

interface RawRuntimeConfig {
  apiBaseUrl?: unknown
  sentryDsn?: unknown
  enableMock?: unknown
  routeMode?: unknown
  environment?: unknown
  release?: unknown
}

function isValidUrl(value: string): boolean {
  try {
    new URL(value)
    return true
  } catch {
    return false
  }
}

function isValidRouteMode(value: unknown): value is 'frontend' | 'backend' {
  return value === 'frontend' || value === 'backend'
}

function isValidEnvironment(
  value: unknown,
): value is 'development' | 'test' | 'stage' | 'production' {
  return value === 'development' || value === 'test' || value === 'stage' || value === 'production'
}

function parseBoolean(value: unknown): boolean {
  if (typeof value === 'boolean') return value
  if (typeof value === 'string') return value === 'true'
  return false
}

export function parseRuntimeConfig(raw: RawRuntimeConfig, mode?: string): RuntimeConfig {
  const environment = isValidEnvironment(raw.environment)
    ? raw.environment
    : mode === 'production'
      ? 'production'
      : 'development'

  const apiBaseUrl = typeof raw.apiBaseUrl === 'string' ? raw.apiBaseUrl : ''
  const sentryDsn = typeof raw.sentryDsn === 'string' ? raw.sentryDsn : ''
  const enableMock = parseBoolean(raw.enableMock)
  const release = typeof raw.release === 'string' ? raw.release : ''

  // Validate routeMode before assignment
  if (raw.routeMode !== undefined && !isValidRouteMode(raw.routeMode)) {
    throw new Error(
      '[RuntimeConfig] routeMode must be "frontend" or "backend". Received: ' +
        JSON.stringify(raw.routeMode),
    )
  }
  const routeMode = isValidRouteMode(raw.routeMode) ? raw.routeMode : 'frontend'

  if (!apiBaseUrl) {
    throw new Error(
      '[RuntimeConfig] apiBaseUrl is required. Received: ' + JSON.stringify(raw.apiBaseUrl),
    )
  }

  if (!isValidUrl(apiBaseUrl)) {
    throw new Error(
      '[RuntimeConfig] apiBaseUrl must be a valid URL. Received: ' + JSON.stringify(apiBaseUrl),
    )
  }

  if (environment === 'production' && enableMock) {
    throw new Error('[RuntimeConfig] enableMock must not be true in production environment')
  }

  return {
    apiBaseUrl,
    sentryDsn,
    enableMock,
    routeMode,
    environment,
    release,
  }
}

declare global {
  interface Window {
    __APP_CONFIG__?: RawRuntimeConfig
  }
}

let cachedConfig: RuntimeConfig | undefined

export function getRuntimeConfig(): RuntimeConfig {
  if (cachedConfig) {
    return cachedConfig
  }

  const raw = window.__APP_CONFIG__ ?? {}
  cachedConfig = parseRuntimeConfig(raw, import.meta.env.MODE)
  return cachedConfig
}

export function resetRuntimeConfigCache(): void {
  cachedConfig = undefined
}
