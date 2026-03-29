import { createRouter, createWebHistory } from 'vue-router'
import { routes } from './routes'
import { setupRouterGuards } from './guards'

export function createAppRouter() {
  const router = createRouter({
    history: createWebHistory(),
    routes,
  })

  setupRouterGuards(router)
  return router
}
