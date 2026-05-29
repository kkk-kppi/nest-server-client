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

  if (!route.name && children.length === 0) return null

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
    // 只处理顶级路由（path 不为空的路由），子路由由父路由递归处理
    const topRoutes = routes.filter((r) => {
      const meta = r.meta as Record<string, unknown> | undefined
      if (meta?.hidden) return false
      if (r.name === 'login' || r.name === 'forbidden' || r.name === 'not-found') return false
      // 子路由的 path 为空字符串，跳过
      if (r.path === '' || r.path === '/') return false
      return true
    })
    return topRoutes.map(routeToMenuOption).filter(Boolean) as MenuOption[]
  })

  return { menuOptions }
}
