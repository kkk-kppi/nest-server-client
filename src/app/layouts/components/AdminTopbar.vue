<script setup lang="ts">
import { ref } from 'vue'
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
}>()

const emit = defineEmits<{
  'update:selectedTop-key': [key: string]
}>()

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

function handleTopMenuClick(key: string) {
  if (props.layoutMode === 'mix') {
    emit('update:selectedTop-key', key)
  }
  // top 模式下不处理点击，因为菜单项没有对应的路由
}
</script>

<template>
  <div style="display: flex; align-items: center; justify-content: space-between; height: 56px">
    <div style="display: flex; align-items: center; gap: 8px">
      <n-button quaternary circle @click="toggleSidebar">
        <template #icon>
          <n-icon :size="20">
            <MenuOutline />
          </n-icon>
        </template>
      </n-button>
      <AdminBreadcrumb v-if="layoutMode === 'side' && setting.showBreadcrumb" />
      <n-menu
        v-if="(layoutMode === 'top' || layoutMode === 'mix') && menuOptions"
        mode="horizontal"
        :options="menuOptions"
        :value="layoutMode === 'mix' ? selectedTopKey : ($route.name as string)"
        @update:value="handleTopMenuClick"
      />
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

      <n-button quaternary circle @click="showSettingPanel = true">
        <template #icon>
          <n-icon :size="18">
            <SettingsOutline />
          </n-icon>
        </template>
      </n-button>

      <AdminUserMenu />
    </n-space>
  </div>

  <AdminSettingPanel v-model:show="showSettingPanel" />
</template>
