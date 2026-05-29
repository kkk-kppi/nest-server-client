interface AppEnv {
  mode: string
  apiBaseUrl: string
  sentryDsn: string
  enableMock: boolean
  routeMode: 'frontend' | 'backend'
}

const env = import.meta.env

function resolveBooleanEnv(value: string | undefined, defaultValue: boolean) {
  if (value === undefined) {
    return defaultValue
  }
  return value === 'true'
}

export const appEnv: AppEnv = {
  mode: env.MODE,
  apiBaseUrl: env.VITE_API_BASE_URL ?? 'http://localhost:3000',
  sentryDsn: env.VITE_SENTRY_DSN ?? '',
  enableMock: resolveBooleanEnv(env.VITE_ENABLE_MOCK, false),
  routeMode: (env.VITE_ROUTE_MODE as 'frontend' | 'backend') ?? 'frontend',
}
