import { bootstrap } from './app/bootstrap'
import { appEnv } from './core/config/env'

async function startApp() {
  if (appEnv.enableMock) {
    const { enableMocking } = await import('./mocks/browser')
    await enableMocking()
  }
  await bootstrap()
}

void startApp()
