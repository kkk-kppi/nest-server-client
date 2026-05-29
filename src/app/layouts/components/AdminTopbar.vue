<script setup lang="ts">
import { ref } from 'vue'
import {
  SunnyOutline,
  MoonOutline,
  ExpandOutline,
  ContractOutline,
  SettingsOutline,
} from '@vicons/ionicons5'
import { useTheme } from '@/core/theme/useTheme'
import { useLayoutSetting } from '@/core/theme/useLayoutSetting'
import AdminBreadcrumb from './AdminBreadcrumb.vue'
import AdminUserMenu from './AdminUserMenu.vue'

defineProps<{
  layoutMode: 'side' | 'top' | 'mix'
}>()

const { isDark, toggleDark } = useTheme()
const { toggleSidebar } = useLayoutSetting()

const isFullscreen = ref(false)

function toggleFullscreen() {
  if (!document.fullscreenElement) {
    document.documentElement.requestFullscreen()
    isFullscreen.value = true
  } else {
    document.exitFullscreen()
    isFullscreen.value = false
  }
}
</script>

<template>
  <div style="display: flex; align-items: center; justify-content: space-between; height: 56px">
    <div style="display: flex; align-items: center; gap: 8px">
      <n-button quaternary circle @click="toggleSidebar">
        <template #icon>
          <n-icon :size="20">
            <SettingsOutline />
          </n-icon>
        </template>
      </n-button>
      <AdminBreadcrumb v-if="layoutMode === 'side'" />
    </div>

    <n-space align="center" :size="8">
      <n-button quaternary circle @click="toggleDark">
        <template #icon>
          <n-icon :size="18">
            <MoonOutline v-if="!isDark" />
            <SunnyOutline v-else />
          </n-icon>
        </template>
      </n-button>

      <n-button quaternary circle @click="toggleFullscreen">
        <template #icon>
          <n-icon :size="18">
            <ContractOutline v-if="isFullscreen" />
            <ExpandOutline v-else />
          </n-icon>
        </template>
      </n-button>

      <AdminUserMenu />
    </n-space>
  </div>
</template>
