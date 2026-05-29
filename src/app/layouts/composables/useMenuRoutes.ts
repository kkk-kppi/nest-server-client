import { h, computed } from 'vue'
import type { RouteRecordRaw } from 'vue-router'
import { NIcon } from 'naive-ui'
import type { MenuOption } from 'naive-ui'
import type { Component } from 'vue'
import {
  GridOutline,
  SettingsOutline,
  PeopleOutline,
  ShieldOutline,
  BookOutline,
  HomeOutline,
  FolderOutline,
  FolderOpenOutline,
  ConstructOutline,
} from '@vicons/ionicons5'
import { routes as staticRoutes } from '@/core/router/routes'
import { createDynamicRoutes } from '@/features/auth/dynamic-routes'
import { useAuthStore } from '@/features/auth/store/useAuthStore'

const iconMap: Record<string, Component> = {
  GridOutline,
  SettingsOutline,
  PeopleOutline,
  ShieldOutline,
  BookOutline,
  HomeOutline,
  FolderOutline,
  FolderOpenOutline,
  ConstructOutline,
}

function renderIcon(iconName: string) {
  const iconComponent = iconMap[iconName]
  if (!iconComponent) return undefined
  return () => h(NIcon, null, { default: () => h(iconComponent) })
}

function routeToMenuOption(route: RouteRecordRaw): MenuOption | null {
  const meta = route.meta as Record<string, unknown> | undefined
  if (meta?.hidden) return null

  const children = (route.children || []).map(routeToMenuOption).filter(Boolean) as MenuOption[]

  if (children.length === 1 && !children[0].children?.length) {
    return children[0]
  }

  if (!route.name && children.length === 0) return null

  return {
    label: (meta?.title as string) || (route.name as string) || '',
    key: (route.name as string) || route.path,
    icon: meta?.icon ? renderIcon(meta.icon as string) : undefined,
    children: children.length > 0 ? children : undefined,
  }
}

export function useMenuRoutes() {
  const authStore = useAuthStore()

  const menuOptions = computed<MenuOption[]>(() => {
    // 使用原始路由定义，避免 router.getRoutes() 返回扁平化数据导致重复
    const dynamicRoutes = createDynamicRoutes(authStore.roles)
    const allRoutes = [...staticRoutes, ...dynamicRoutes]

    return allRoutes.map(routeToMenuOption).filter(Boolean) as MenuOption[]
  })

  return { menuOptions }
}
