import type { RouteRecordRaw } from 'vue-router'
import type { Component } from 'vue'
import { routes as staticRoutes } from '@/core/router/routes'
import { createDynamicRoutes } from '@/features/auth/dynamic-routes'
import { getRoutes, type RouteConfig } from '@/features/auth/api'
import type { UserRole } from '@/features/auth/store/useAuthStore'
import { appEnv } from '@/core/config/env'

// 组件映射表
const componentMap: Record<string, () => Promise<Component>> = {
  AdminLayout: () => import('@/app/layouts/AdminLayout.vue'),
  DashboardView: () => import('@/app/views/DashboardView.vue'),
  WorkspaceView: () => import('@/features/workspace/views/WorkspaceView.vue'),
  AdminView: () => import('@/features/admin/views/AdminView.vue'),
  UserManageView: () => import('@/features/system/views/UserManageView.vue'),
  RoleManageView: () => import('@/features/system/views/RoleManageView.vue'),
  DictManageView: () => import('@/features/system/views/DictManageView.vue'),
}

// Validate route config
function validateRouteConfig(config: RouteConfig, usedNames: Set<string>): void {
  // Validate path
  if (!config.path || typeof config.path !== 'string') {
    throw new Error(`Invalid route path: ${config.path}`)
  }

  // Validate component if provided
  if (config.component && !(config.component in componentMap)) {
    throw new Error(`Unknown component "${config.component}" in route "${config.path}"`)
  }

  // Validate unique name if provided
  if (config.name) {
    if (usedNames.has(config.name)) {
      throw new Error(`Duplicate route name "${config.name}"`)
    }
    usedNames.add(config.name)
  }

  // Validate meta
  if (!config.meta || !config.meta.title) {
    throw new Error(`Missing required meta.title for route "${config.path}"`)
  }

  // Validate children recursively
  if (config.children) {
    for (const child of config.children) {
      validateRouteConfig(child, usedNames)
    }
  }
}

// 将后端返回的路由配置转换为 Vue Router 路由记录
function convertRouteConfig(config: RouteConfig): RouteRecordRaw {
  const route: Record<string, unknown> = {
    path: config.path,
    name: config.name,
    meta: config.meta,
    children: config.children?.map(convertRouteConfig),
  }
  if (config.component) {
    route.component = componentMap[config.component]
  }
  if (config.redirect) {
    route.redirect = config.redirect
  }
  return route as unknown as RouteRecordRaw
}

// 获取动态路由（前端模式）
function getFrontendDynamicRoutes(roles: UserRole[]): RouteRecordRaw[] {
  return createDynamicRoutes(roles)
}

// 获取动态路由（后端模式）
async function getBackendDynamicRoutes(): Promise<RouteRecordRaw[]> {
  try {
    const routeConfigs = await getRoutes()

    // Validate all route configs before converting
    const usedNames = new Set<string>()
    for (const config of routeConfigs) {
      validateRouteConfig(config, usedNames)
    }

    return routeConfigs.map(convertRouteConfig)
  } catch (error) {
    console.error('[RouteMode] Failed to fetch routes from backend:', error)
    // Re-throw validation errors with original message
    if (error instanceof Error) {
      throw error
    }
    throw new Error('Failed to load routes from backend')
  }
}

// 获取所有路由
export async function getAllRoutes(roles: UserRole[]): Promise<RouteRecordRaw[]> {
  const dynamicRoutes =
    appEnv.routeMode === 'backend'
      ? await getBackendDynamicRoutes()
      : getFrontendDynamicRoutes(roles)

  return [...staticRoutes, ...dynamicRoutes]
}

// 获取动态路由（用于路由守卫）
export async function getDynamicRoutes(roles: UserRole[]): Promise<RouteRecordRaw[]> {
  if (appEnv.routeMode === 'backend') {
    return getBackendDynamicRoutes()
  }
  return getFrontendDynamicRoutes(roles)
}
