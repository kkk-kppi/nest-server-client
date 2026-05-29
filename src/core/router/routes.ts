import type { RouteRecordRaw } from 'vue-router'
import type { AccessMeta } from '@/features/auth/permission'

declare module 'vue-router' {
  interface RouteMeta extends AccessMeta {
    requiresAuth?: boolean
    title?: string
    icon?: string
    hidden?: boolean
    order?: number
  }
}

export const routes: RouteRecordRaw[] = [
  {
    path: '/login',
    name: 'login',
    component: () => import('@/features/home/views/LoginView.vue'),
    meta: { title: '登录', hidden: true },
  },
  {
    path: '/',
    redirect: '/dashboard',
  },
  {
    path: '/dashboard',
    component: () => import('@/app/layouts/AdminLayout.vue'),
    children: [
      {
        path: '',
        name: 'dashboard',
        component: () => import('@/app/views/DashboardView.vue'),
        meta: { title: '仪表盘', icon: 'GridOutline', order: 0, requiresAuth: true },
      },
    ],
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
