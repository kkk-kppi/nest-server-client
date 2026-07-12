import { createApp } from 'vue'
import AppRoot from './AppRoot.vue'
import { createStore } from '@/core/store'
import { createAppRouter } from '@/core/router'
import { i18n } from '@/core/i18n'
import { setAccessTokenGetter, setUnauthorizedHandler } from '@/core/http'
import { useAuthStore } from '@/features/auth/store/useAuthStore'
import { clearDynamicRoutes } from '@/core/router/dynamic'
import { initObservability } from '@/core/observability'
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

  app.config.errorHandler = (err, _instance, info) => {
    console.error('[Global Error]', err, info)
  }

  await initObservability(app, router)

  app.mount('#app')
}
