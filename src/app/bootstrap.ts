import { createApp } from 'vue'
import AppRoot from './AppRoot.vue'
import { createStore } from '@/core/store'
import { createAppRouter } from '@/core/router'
import { setAccessTokenGetter, setUnauthorizedHandler } from '@/core/http'
import { useAuthStore } from '@/features/auth/store/useAuthStore'
import { initObservability } from '@/core/observability'
import '../style.css'

export async function bootstrap() {
  const app = createApp(AppRoot)
  const store = createStore()
  const router = createAppRouter()
  app.use(store)
  app.use(router)

  const authStore = useAuthStore()
  setAccessTokenGetter(() => authStore.accessToken)
  setUnauthorizedHandler(() => {
    authStore.clearSession()
    authStore.setAuthNotice('登录状态已失效，请重新登录')
    router.replace({ name: 'home' })
  })

  app.config.errorHandler = (err, _instance, info) => {
    console.error('[Global Error]', err, info)
    // 后续接入 Sentry 时在此上报
  }

  await initObservability(app, router)

  app.mount('#app')
}
