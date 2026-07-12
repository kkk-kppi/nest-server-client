/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly MODE: string
  readonly VITE_API_BASE_URL?: string
  readonly VITE_SENTRY_DSN?: string
  readonly VITE_ENABLE_MOCK?: string
  readonly VITE_ROUTE_MODE?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

interface Window {
  __APP_CONFIG__?: {
    apiBaseUrl?: unknown
    sentryDsn?: unknown
    enableMock?: unknown
    routeMode?: unknown
    environment?: unknown
    release?: unknown
  }
}
