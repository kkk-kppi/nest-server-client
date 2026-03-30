import type { RouteRecordRaw } from 'vue-router'
import type { AccessMeta } from '@/features/auth/permission'

declare module 'vue-router' {
  interface RouteMeta extends AccessMeta {
    requiresAuth?: boolean
    title?: string
  }
}

export const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'home',
    component: () => import('@/features/home/views/HomeView.vue'),
    meta: {
      title: 'Home',
    },
  },
  {
    path: '/forbidden',
    name: 'forbidden',
    component: () => import('@/app/views/ForbiddenView.vue'),
    meta: {
      title: 'Forbidden',
    },
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'not-found',
    component: () => import('@/app/views/NotFoundView.vue'),
    meta: {
      title: 'Not Found',
    },
  },
]
