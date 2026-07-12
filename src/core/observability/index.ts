import type { App } from 'vue'
import type { Router } from 'vue-router'
import { appEnv } from '@/core/config/env'
import {
  setTelemetryAdapter,
  reportMetric,
  type TelemetryAdapter,
  type TelemetryUser,
  type TelemetryBreadcrumb,
  type TelemetryMetric,
} from './telemetry'

export {
  captureException,
  captureMessage,
  setUser,
  addBreadcrumb,
  reportMetric,
  setTelemetryAdapter,
  type TelemetryAdapter,
  type TelemetryUser,
  type TelemetryBreadcrumb,
  type TelemetryMetric,
} from './telemetry'

export async function initObservability(app: App, router: Router) {
  if (!appEnv.sentryDsn) {
    console.info('[Observability] Sentry DSN not configured, skipping initialization')
    initWebVitals()
    return
  }

  try {
    const Sentry = await import('@sentry/vue')

    // Create Sentry adapter
    const sentryAdapter: TelemetryAdapter = {
      captureException(error, context) {
        Sentry.captureException(error, { extra: context })
      },
      captureMessage(message, context) {
        Sentry.captureMessage(message, { extra: context })
      },
      setUser(user: TelemetryUser | null) {
        Sentry.setUser(user ? { id: user.id, email: user.email, username: user.username } : null)
      },
      addBreadcrumb(breadcrumb: TelemetryBreadcrumb) {
        Sentry.addBreadcrumb({
          type: breadcrumb.type,
          category: breadcrumb.category,
          message: breadcrumb.message,
          level: breadcrumb.level,
          data: breadcrumb.data,
        })
      },
      reportMetric(metric: TelemetryMetric) {
        // Sentry doesn't have a direct metric API, use breadcrumb
        Sentry.addBreadcrumb({
          type: 'metric',
          category: 'web-vitals',
          message: `${metric.name}: ${metric.value}`,
          data: metric,
        })
      },
    }

    Sentry.init({
      app,
      dsn: appEnv.sentryDsn,
      environment: appEnv.mode,
      integrations: [Sentry.browserTracingIntegration({ router })],
      tracesSampleRate: appEnv.mode === 'production' ? 0.1 : 1.0,
      replaysSessionSampleRate: 0,
      replaysOnErrorSampleRate: 1.0,
    })

    setTelemetryAdapter(sentryAdapter)
  } catch (err) {
    console.error('[Observability] Failed to initialize Sentry:', err)
  }

  initWebVitals()
}

async function initWebVitals() {
  try {
    const { onCLS, onINP, onLCP, onFCP, onTTFB } = await import('web-vitals')

    const reportWebVital = (metric: {
      name: string
      value: number
      rating: string
      id: string
    }) => {
      reportMetric({
        name: metric.name,
        value: metric.value,
        unit: 'ms',
        tags: { rating: metric.rating },
      })
    }

    onCLS(reportWebVital)
    onINP(reportWebVital)
    onLCP(reportWebVital)
    onFCP(reportWebVital)
    onTTFB(reportWebVital)
  } catch (err) {
    console.error('[Observability] Failed to initialize Web-Vitals:', err)
  }
}
