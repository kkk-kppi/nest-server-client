export interface TelemetryUser {
  id: string
  email?: string
  username?: string
}

export interface TelemetryBreadcrumb {
  type: string
  category: string
  message: string
  level?: 'info' | 'warning' | 'error'
  data?: Record<string, unknown>
}

export interface TelemetryMetric {
  name: string
  value: number
  unit?: string
  tags?: Record<string, string>
}

export interface TelemetryAdapter {
  captureException(error: Error, context?: Record<string, unknown>): void
  captureMessage(message: string, context?: Record<string, unknown>): void
  setUser(user: TelemetryUser | null): void
  addBreadcrumb(breadcrumb: TelemetryBreadcrumb): void
  reportMetric(metric: TelemetryMetric): void
}

// Global telemetry adapter
let telemetryAdapter: TelemetryAdapter | null = null

// Error deduplication set
const capturedErrors = new WeakSet<Error>()

export function setTelemetryAdapter(adapter: TelemetryAdapter): void {
  telemetryAdapter = adapter
}

export function getTelemetryAdapter(): TelemetryAdapter | null {
  return telemetryAdapter
}

export function captureException(error: Error, context?: Record<string, unknown>): void {
  // Deduplicate: same Error instance should only be reported once
  if (capturedErrors.has(error)) {
    return
  }
  capturedErrors.add(error)

  if (telemetryAdapter) {
    telemetryAdapter.captureException(error, context)
  } else {
    console.error('[Telemetry] Unhandled exception:', error, context)
  }
}

export function captureMessage(message: string, context?: Record<string, unknown>): void {
  if (telemetryAdapter) {
    telemetryAdapter.captureMessage(message, context)
  } else {
    console.info('[Telemetry] Message:', message, context)
  }
}

export function setUser(user: TelemetryUser | null): void {
  if (telemetryAdapter) {
    telemetryAdapter.setUser(user)
  }
}

export function addBreadcrumb(breadcrumb: TelemetryBreadcrumb): void {
  if (telemetryAdapter) {
    telemetryAdapter.addBreadcrumb(breadcrumb)
  }
}

export function reportMetric(metric: TelemetryMetric): void {
  if (telemetryAdapter) {
    telemetryAdapter.reportMetric(metric)
  } else {
    console.info(`[Telemetry] Metric: ${metric.name}=${metric.value}`)
  }
}
