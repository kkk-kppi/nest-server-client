import type { RouteRecordRaw } from 'vue-router'

export const workspaceRoutes: RouteRecordRaw[] = [
  {
    path: '/workspace',
    component: () => import('@/app/layouts/AdminLayout.vue'),
    children: [
      {
        path: '',
        name: 'workspace',
        component: () => import('./views/WorkspaceView.vue'),
        meta: {
          title: '工作空间',
          icon: 'FolderOpenOutline',
          order: 1,
          requiresAuth: true,
          roles: ['admin', 'editor', 'viewer'],
          permissions: ['workspace:read'],
        },
      },
    ],
  },
]
