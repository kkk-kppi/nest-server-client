<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import {
  SunnyOutline,
  MoonOutline,
  ExpandOutline,
  ContractOutline,
  SettingsOutline,
  MenuOutline,
} from '@vicons/ionicons5'
import { useTheme } from '@/core/theme/useTheme'
import { useLayoutSetting } from '@/core/theme/useLayoutSetting'
import AdminBreadcrumb from './AdminBreadcrumb.vue'
import AdminUserMenu from './AdminUserMenu.vue'
import AdminSettingPanel from './AdminSettingPanel.vue'
import type { MenuOption } from 'naive-ui'

const props = defineProps<{
  layoutMode: 'side' | 'top' | 'mix'
  menuOptions?: MenuOption[]
  selectedTopKey?: string
  isMobile?: boolean
}>()

const emit = defineEmits<{
  'update:selectedTop-key': [key: string]
  'toggle-mobile-sidebar': []
}>()

const router = useRouter()
const { isDark, toggleDark } = useTheme()
const { setting, toggleSidebar } = useLayoutSetting()

const isFullscreen = ref(false)
const showSettingPanel = ref(false)

function toggleFullscreen() {
  if (!document.fullscreenElement) {
    document.documentElement.requestFullscreen()
    isFullscreen.value = true
  } else {
    document.exitFullscreen()
    isFullscreen.value = false
  }
}

function handleToggleSidebar() {
  if (props.isMobile) {
    emit('toggle-mobile-sidebar')
  } else {
    toggleSidebar()
  }
}

function handleTopMenuClick(key: string) {
  if (props.layoutMode === 'mix') {
    emit('update:selectedTop-key', key)
    const option = props.menuOptions?.find((item) => item.key === key)
    if (option?.children?.length) {
      const firstChild = option.children[0]
      if (firstChild?.key) {
        router.push({ name: firstChild.key as string })
      }
    }
  } else if (props.layoutMode === 'top') {
    router.push({ name: key })
  }
}
</script>

<template>
  <header class="topbar" role="banner">
    <div class="topbar-left">
      <n-button
        quaternary
        circle
        aria-label="切换侧边栏"
        :aria-expanded="!setting.sidebarCollapsed"
        @click="handleToggleSidebar"
      >
        <template #icon>
          <n-icon :size="20">
            <MenuOutline />
          </n-icon>
        </template>
      </n-button>
      <AdminBreadcrumb v-if="layoutMode === 'side' && setting.showBreadcrumb && !isMobile" />
      <n-menu
        v-if="(layoutMode === 'top' || layoutMode === 'mix') && menuOptions && !isMobile"
        mode="horizontal"
        :options="menuOptions"
        :value="layoutMode === 'mix' ? selectedTopKey : ($route.name as string)"
        @update:value="handleTopMenuClick"
      />
    </div>

    <n-space align="center" :size="isMobile ? 'small' : 'medium'">
      <n-button
        quaternary
        circle
        :aria-label="isDark ? '切换到浅色模式' : '切换到深色模式'"
        :aria-pressed="isDark"
        @click="toggleDark"
      >
        <template #icon>
          <n-icon :size="18">
            <MoonOutline v-if="!isDark" />
            <SunnyOutline v-else />
          </n-icon>
        </template>
      </n-button>

      <n-button
        v-if="!isMobile"
        quaternary
        circle
        :aria-label="isFullscreen ? '退出全屏' : '进入全屏'"
        :aria-pressed="isFullscreen"
        @click="toggleFullscreen"
      >
        <template #icon>
          <n-icon :size="18">
            <ContractOutline v-if="isFullscreen" />
            <ExpandOutline v-else />
          </n-icon>
        </template>
      </n-button>

      <n-button quaternary circle aria-label="打开设置" @click="showSettingPanel = true">
        <template #icon>
          <n-icon :size="18">
            <SettingsOutline />
          </n-icon>
        </template>
      </n-button>

      <AdminUserMenu />
    </n-space>
  </header>

  <AdminSettingPanel v-model:show="showSettingPanel" />
</template>

<style scoped>
.topbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: var(--topbar-height);
  padding: 0 var(--space-4);
}

.topbar-left {
  display: flex;
  align-items: center;
  gap: var(--space-2);
}

@media (max-width: 767px) {
  .topbar {
    height: 48px;
    padding: 0 var(--space-3);
  }
}
</style>
