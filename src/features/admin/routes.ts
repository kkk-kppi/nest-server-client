import type { RouteRecordRaw } from 'vue-router'

export const adminRoutes: RouteRecordRaw[] = [
  {
    path: '/admin',
    component: () => import('@/app/layouts/AdminLayout.vue'),
    children: [
      {
        path: '',
        name: 'admin',
        component: () => import('./views/AdminView.vue'),
        meta: {
          title: '管理面板',
          icon: 'ConstructOutline',
          order: 2,
          requiresAuth: true,
          roles: ['admin'],
          permissions: ['admin:read'],
        },
      },
    ],
  },
]
