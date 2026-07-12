import { getRuntimeConfig } from './runtime-config'

interface AppEnv {
  mode: string
  apiBaseUrl: string
  sentryDsn: string
  enableMock: boolean
  routeMode: 'frontend' | 'backend'
}

const env = import.meta.env

export function getAppEnv(): AppEnv {
  const runtimeConfig = getRuntimeConfig()

  return {
    mode: env.MODE,
    apiBaseUrl: runtimeConfig.apiBaseUrl,
    sentryDsn: runtimeConfig.sentryDsn,
    enableMock: runtimeConfig.enableMock,
    routeMode: runtimeConfig.routeMode,
  }
}

// Legacy export for backward compatibility
export const appEnv: AppEnv = {
  mode: env.MODE,
  apiBaseUrl: env.VITE_API_BASE_URL ?? 'http://localhost:3000',
  sentryDsn: env.VITE_SENTRY_DSN ?? '',
  enableMock: env.VITE_ENABLE_MOCK === 'true',
  routeMode: (env.VITE_ROUTE_MODE as 'frontend' | 'backend') ?? 'frontend',
}
