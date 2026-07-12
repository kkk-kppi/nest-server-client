import { bootstrap } from './app/bootstrap'
import { appEnv } from './core/config/env'
import { captureException } from './core/observability'

async function startApp() {
  if (appEnv.enableMock) {
    const { enableMocking } = await import('./mocks/browser')
    await enableMocking()
  }
  await bootstrap()
}

void startApp().catch((error) => {
  // Capture bootstrap error
  captureException(error instanceof Error ? error : new Error(String(error)), {
    phase: 'bootstrap',
  })

  // Render static error UI
  const appElement = document.getElementById('app')
  if (appElement) {
    appElement.innerHTML = `
      <div style="display:grid;place-items:center;min-height:100vh;padding:2rem;text-align:center;">
        <h1 style="font-size:2rem;margin:0;">应用启动失败</h1>
        <p style="margin:1rem 0;">抱歉，应用启动过程中发生了错误，请尝试刷新页面。</p>
        <button onclick="window.location.reload()" style="padding:0.5rem 1rem;border:1px solid #ccc;border-radius:4px;background:transparent;cursor:pointer;">
          刷新页面
        </button>
      </div>
    `
  }
})
