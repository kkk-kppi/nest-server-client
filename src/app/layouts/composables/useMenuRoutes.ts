import { h, shallowRef, watchEffect, computed } from 'vue'
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
import { useAuthStore } from '@/features/auth/store/useAuthStore'
import { getAllRoutes } from '@/core/router/route-mode'

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
  const menuOptions = shallowRef<MenuOption[]>([])
  const selectedTopKey = shallowRef<string>('')

  watchEffect(async () => {
    try {
      const allRoutes = await getAllRoutes(authStore.roles)
      menuOptions.value = allRoutes.map(routeToMenuOption).filter(Boolean) as MenuOption[]
    } catch (error) {
      console.error('[useMenuRoutes] Failed to load routes:', error)
      menuOptions.value = []
    }
  })

  // 一级菜单（用于混合模式顶部）
  const topMenuOptions = computed<MenuOption[]>(() => {
    return menuOptions.value.map((item) => ({
      label: item.label,
      key: item.key,
      icon: item.icon,
    }))
  })

  // 二级菜单（用于混合模式侧边栏）
  const subMenuOptions = computed<MenuOption[]>(() => {
    if (!selectedTopKey.value) {
      return (menuOptions.value[0]?.children as MenuOption[]) || []
    }
    const selected = menuOptions.value.find((item) => item.key === selectedTopKey.value)
    return (selected?.children as MenuOption[]) || []
  })

  function setSelectedTopKey(key: string) {
    selectedTopKey.value = key
  }

  return {
    menuOptions,
    topMenuOptions,
    subMenuOptions,
    selectedTopKey,
    setSelectedTopKey,
  }
}
