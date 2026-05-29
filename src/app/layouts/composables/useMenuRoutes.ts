import { computed } from 'vue'
import { useRouter, type RouteRecordRaw } from 'vue-router'
import type { MenuOption } from 'naive-ui'

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
    icon: meta?.icon ? () => meta.icon as string : undefined,
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
        return (
          !meta?.hidden && r.name !== 'login' && r.name !== 'forbidden' && r.name !== 'not-found'
        )
      })
      .map(routeToMenuOption)
      .filter(Boolean) as MenuOption[]
  })

  return { menuOptions }
}
