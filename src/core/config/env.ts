interface AppEnv {
  mode: string
  apiBaseUrl: string
  sentryDsn: string
}

const env = import.meta.env

export const appEnv: AppEnv = {
  mode: env.MODE,
  apiBaseUrl: env.VITE_API_BASE_URL ?? 'http://localhost:3000',
  sentryDsn: env.VITE_SENTRY_DSN ?? '',
}
