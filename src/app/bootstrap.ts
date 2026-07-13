import { createApp } from 'vue'
import AppRoot from './AppRoot.vue'
import { createStore } from '@/core/store'
import { createAppRouter } from '@/core/router'
import { i18n } from '@/core/i18n'
import { setAccessTokenGetter, setUnauthorizedHandler } from '@/core/http'
import { useAuthStore } from '@/features/auth/store/useAuthStore'
import { clearDynamicRoutes } from '@/core/router/dynamic'
import { initObservability, captureException, setUser } from '@/core/observability'
import '../styles/tokens.css'
import '../style.css'

export async function bootstrap() {
  const app = createApp(AppRoot)
  const store = createStore()
  const router = createAppRouter()
  app.use(store)
  app.use(router)
  app.use(i18n)

  const authStore = useAuthStore()
  setAccessTokenGetter(() => authStore.accessToken)
  setUnauthorizedHandler(() => {
    // Clear dynamic routes before clearing session
    clearDynamicRoutes(router)
    authStore.clearSession()
    authStore.setAuthNotice('登录状态已失效，请重新登录')
    router.replace({ name: 'login' })
  })

  // Set up global error handler
  app.config.errorHandler = (err, _instance, info) => {
    captureException(err instanceof Error ? err : new Error(String(err)), {
      phase: 'vue',
      info,
    })
  }

  // Set up unhandled rejection handler
  window.addEventListener('unhandledrejection', (event) => {
    captureException(
      event.reason instanceof Error ? event.reason : new Error(String(event.reason)),
      {
        phase: 'unhandledrejection',
      },
    )
  })

  await initObservability(app, router)

  // Set user info for telemetry if authenticated
  if (authStore.isAuthenticated) {
    setUser({
      id: authStore.accessToken || '',
      username: 'authenticated-user',
    })
  }

  app.mount('#app')
}
