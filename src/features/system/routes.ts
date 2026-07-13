import type { RouteRecordRaw } from 'vue-router'

export const systemRoutes: RouteRecordRaw[] = [
  {
    path: '/system',
    component: () => import('@/app/layouts/AdminLayout.vue'),
    meta: {
      title: '系统管理',
      icon: 'SettingsOutline',
      order: 99,
      requiresAuth: true,
      roles: ['admin'],
      permissions: ['admin:read'],
    },
    children: [
      {
        path: 'user',
        name: 'system-user',
        component: () => import('./views/UserManageView.vue'),
        meta: {
          title: '用户管理',
          icon: 'PeopleOutline',
          requiresAuth: true,
          roles: ['admin'],
          permissions: ['admin:read'],
        },
      },
      {
        path: 'role',
        name: 'system-role',
        component: () => import('./views/RoleManageView.vue'),
        meta: {
          title: '角色管理',
          icon: 'ShieldOutline',
          requiresAuth: true,
          roles: ['admin'],
          permissions: ['admin:read'],
        },
      },
      {
        path: 'dict',
        name: 'system-dict',
        component: () => import('./views/DictManageView.vue'),
        meta: {
          title: '字典管理',
          icon: 'BookOutline',
          requiresAuth: true,
          roles: ['admin'],
          permissions: ['admin:read'],
        },
      },
    ],
  },
]
