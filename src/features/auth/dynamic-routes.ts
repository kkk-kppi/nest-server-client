import type { RouteRecordRaw } from 'vue-router'
import type { UserRole } from './store/useAuthStore'
import WorkspaceView from '@/features/workspace/views/WorkspaceView.vue'
import AdminView from '@/features/admin/views/AdminView.vue'

function getRoleRoutes(role: UserRole): RouteRecordRaw[] {
  if (role === 'admin') {
    return [
      {
        path: '/workspace',
        name: 'workspace',
        component: WorkspaceView,
        meta: {
          title: 'Workspace',
          requiresAuth: true,
          roles: ['admin', 'editor', 'viewer'],
          permissions: ['workspace:read'],
        },
      },
      {
        path: '/admin',
        name: 'admin',
        component: AdminView,
        meta: {
          title: 'Admin',
          requiresAuth: true,
          roles: ['admin'],
          permissions: ['admin:read'],
        },
      },
    ]
  }

  if (role === 'editor') {
    return [
      {
        path: '/workspace',
        name: 'workspace',
        component: WorkspaceView,
        meta: {
          title: 'Workspace',
          requiresAuth: true,
          roles: ['admin', 'editor', 'viewer'],
          permissions: ['workspace:read'],
        },
      },
    ]
  }

  return [
    {
      path: '/workspace',
      name: 'workspace',
      component: WorkspaceView,
      meta: {
        title: 'Workspace',
        requiresAuth: true,
        roles: ['admin', 'editor', 'viewer'],
        permissions: ['workspace:read'],
      },
    },
  ]
}

export function createDynamicRoutes(roles: UserRole[]) {
  const routeMap = new Map<string, RouteRecordRaw>()

  roles.forEach((role) => {
    const roleRoutes = getRoleRoutes(role)
    roleRoutes.forEach((route) => {
      if (route.name && !routeMap.has(String(route.name))) {
        routeMap.set(String(route.name), route)
      }
    })
  })

  return Array.from(routeMap.values())
}
