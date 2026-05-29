import { h, computed } from 'vue'
import { useRouter, type RouteRecordRaw } from 'vue-router'
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

  return {
    label: (meta?.title as string) || (route.name as string) || '',
    key: (route.name as string) || route.path,
    icon: meta?.icon ? renderIcon(meta.icon as string) : undefined,
    children: children.length > 0 ? children : undefined,
  }
}

export function useMenuRoutes() {
  const router = useRouter()

  const menuOptions = computed<MenuOption[]>(() => {
    const routes = router.getRoutes()
    return routes
      .filter((r) => {
        const meta = r.meta as Record<string, unknown> | undefined
        // 只显示有 name 的路由（实际页面），过滤掉布局包装路由和隐藏路由
        return (
          r.name &&
          !meta?.hidden &&
          r.name !== 'login' &&
          r.name !== 'forbidden' &&
          r.name !== 'not-found'
        )
      })
      .map(routeToMenuOption)
      .filter(Boolean) as MenuOption[]
  })

  return { menuOptions }
}
