import type { RouteRecordRaw } from 'vue-router'
import type { AccessMeta } from '@/features/auth/permission'
import ForbiddenView from '@/app/views/ForbiddenView.vue'
import NotFoundView from '@/app/views/NotFoundView.vue'
import HomeView from '@/features/home/views/HomeView.vue'

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
    component: HomeView,
    meta: {
      title: 'Home',
    },
  },
  {
    path: '/admin',
    name: 'admin',
    component: () => import('@/features/admin/views/AdminView.vue'),
    meta: {
      title: 'Admin',
      requiresAuth: true,
      roles: ['admin'],
      permissions: ['admin:read'],
    },
  },
  {
    path: '/workspace',
    name: 'workspace',
    component: () => import('@/features/workspace/views/WorkspaceView.vue'),
    meta: {
      title: 'Workspace',
      requiresAuth: true,
      roles: ['admin', 'editor', 'viewer'],
      permissions: ['workspace:read'],
    },
  },
  {
    path: '/forbidden',
    name: 'forbidden',
    component: ForbiddenView,
    meta: {
      title: 'Forbidden',
    },
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'not-found',
    component: NotFoundView,
    meta: {
      title: 'Not Found',
    },
  },
]
