import type { App } from 'vue'
import type { Router } from 'vue-router'
import { appEnv } from '@/core/config/env'

export async function initObservability(app: App, router: Router) {
  if (!appEnv.sentryDsn) {
    console.info('[Observability] Sentry DSN not configured, skipping initialization')
    return
  }

  try {
    const Sentry = await import('@sentry/vue')

    Sentry.init({
      app,
      dsn: appEnv.sentryDsn,
      environment: appEnv.mode,
      integrations: [Sentry.browserTracingIntegration({ router })],
      tracesSampleRate: appEnv.mode === 'production' ? 0.1 : 1.0,
      replaysSessionSampleRate: 0,
      replaysOnErrorSampleRate: 1.0,
    })
  } catch (err) {
    console.error('[Observability] Failed to initialize Sentry:', err)
    return
  }

  initWebVitals()
}

async function initWebVitals() {
  try {
    const { onCLS, onINP, onLCP, onFCP, onTTFB } = await import('web-vitals')

    const reportMetric = (metric: { name: string; value: number; rating: string; id: string }) => {
      console.info(`[Web-Vitals] ${metric.name}: ${metric.value.toFixed(2)}`)
    }

    onCLS(reportMetric)
    onINP(reportMetric)
    onLCP(reportMetric)
    onFCP(reportMetric)
    onTTFB(reportMetric)
  } catch (err) {
    console.error('[Observability] Failed to initialize Web-Vitals:', err)
  }
}
