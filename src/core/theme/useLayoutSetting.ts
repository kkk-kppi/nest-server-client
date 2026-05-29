import { ref, watch } from 'vue'

export type LayoutMode = 'side' | 'top' | 'mix'

export interface LayoutSetting {
  mode: LayoutMode
  showTabs: boolean
  showBreadcrumb: boolean
  fixedHeader: boolean
  sidebarCollapsed: boolean
  sidebarWidth: number
}

const STORAGE_KEY = 'app-layout-setting'

const defaults: LayoutSetting = {
  mode: 'side',
  showTabs: true,
  showBreadcrumb: true,
  fixedHeader: true,
  sidebarCollapsed: false,
  sidebarWidth: 220,
}

function loadSetting(): LayoutSetting {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) return { ...defaults, ...JSON.parse(stored) }
  } catch {
    // ignore parse errors
  }
  return { ...defaults }
}

const setting = ref<LayoutSetting>(loadSetting())

watch(
  setting,
  (s) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(s))
  },
  { deep: true },
)

export function useLayoutSetting() {
  return {
    setting,
    setLayoutMode(mode: LayoutMode) {
      setting.value.mode = mode
    },
    toggleSidebar() {
      setting.value.sidebarCollapsed = !setting.value.sidebarCollapsed
    },
    updateSetting(partial: Partial<LayoutSetting>) {
      Object.assign(setting.value, partial)
    },
  }
}
