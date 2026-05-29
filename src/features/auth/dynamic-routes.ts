import type { RouteRecordRaw } from 'vue-router'
import type { UserRole } from './store/useAuthStore'

function getRoleRoutes(role: UserRole): RouteRecordRaw[] {
  if (role === 'admin') {
    return [
      {
        path: '/workspace',
        component: () => import('@/app/layouts/AdminLayout.vue'),
        children: [
          {
            path: '',
            name: 'workspace',
            component: () => import('@/features/workspace/views/WorkspaceView.vue'),
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
      {
        path: '/admin',
        component: () => import('@/app/layouts/AdminLayout.vue'),
        children: [
          {
            path: '',
            name: 'admin',
            component: () => import('@/features/admin/views/AdminView.vue'),
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
            component: () => import('@/features/system/views/UserManageView.vue'),
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
            component: () => import('@/features/system/views/RoleManageView.vue'),
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
            component: () => import('@/features/system/views/DictManageView.vue'),
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
  }

  if (role === 'editor') {
    return [
      {
        path: '/workspace',
        component: () => import('@/app/layouts/AdminLayout.vue'),
        children: [
          {
            path: '',
            name: 'workspace',
            component: () => import('@/features/workspace/views/WorkspaceView.vue'),
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
  }

  return [
    {
      path: '/workspace',
      component: () => import('@/app/layouts/AdminLayout.vue'),
      children: [
        {
          path: '',
          name: 'workspace',
          component: () => import('@/features/workspace/views/WorkspaceView.vue'),
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
}

export function createDynamicRoutes(roles: UserRole[]) {
  const routeMap = new Map<string, RouteRecordRaw>()
  const anonymousRoutes: RouteRecordRaw[] = []

  roles.forEach((role) => {
    const roleRoutes = getRoleRoutes(role)
    roleRoutes.forEach((route) => {
      if (route.name) {
        if (!routeMap.has(String(route.name))) {
          routeMap.set(String(route.name), route)
        }
      } else {
        if (!anonymousRoutes.some((r) => r.path === route.path)) {
          anonymousRoutes.push(route)
        }
      }
    })
  })

  return [...anonymousRoutes, ...Array.from(routeMap.values())]
}
