<script setup lang="ts">
import type { Component } from 'vue'
import { SunnyOutline, MoonOutline, DesktopOutline } from '@vicons/ionicons5'
import { useTheme } from '@/core/theme/useTheme'
import { useLayoutSetting } from '@/core/theme/useLayoutSetting'
import type { LayoutMode } from '@/core/theme/useLayoutSetting'
import type { ThemeMode } from '@/core/theme/useTheme'

defineProps<{ show: boolean }>()
const emit = defineEmits<{ 'update:show': [value: boolean] }>()

const { mode: themeMode, setMode: setThemeMode } = useTheme()
const { setting, updateSetting, setLayoutMode } = useLayoutSetting()

const layoutModes: { key: LayoutMode; label: string }[] = [
  { key: 'side', label: '侧边菜单' },
  { key: 'top', label: '顶部菜单' },
  { key: 'mix', label: '混合菜单' },
]

const themeModes: { key: ThemeMode; label: string; icon: Component }[] = [
  { key: 'light', label: '亮色', icon: SunnyOutline },
  { key: 'dark', label: '暗色', icon: MoonOutline },
  { key: 'system', label: '跟随系统', icon: DesktopOutline },
]
</script>

<template>
  <n-drawer :show="show" :width="320" @update:show="emit('update:show', $event)">
    <n-drawer-content title="布局设置">
      <n-text strong>布局模式</n-text>
      <n-space style="margin: 12px 0">
        <n-button
          v-for="m in layoutModes"
          :key="m.key"
          :type="setting.mode === m.key ? 'primary' : 'default'"
          size="small"
          @click="setLayoutMode(m.key)"
        >
          {{ m.label }}
        </n-button>
      </n-space>

      <n-divider />

      <n-text strong>主题模式</n-text>
      <n-space style="margin: 12px 0">
        <n-button
          v-for="t in themeModes"
          :key="t.key"
          :type="themeMode === t.key ? 'primary' : 'default'"
          size="small"
          @click="setThemeMode(t.key)"
        >
          <template #icon>
            <n-icon><component :is="t.icon" /></n-icon>
          </template>
          {{ t.label }}
        </n-button>
      </n-space>

      <n-divider />

      <n-text strong>界面功能</n-text>
      <div style="margin-top: 12px; display: flex; flex-direction: column; gap: 12px">
        <div style="display: flex; justify-content: space-between; align-items: center">
          <n-text>多标签页</n-text>
          <n-switch :value="setting.showTabs" @update:value="updateSetting({ showTabs: $event })" />
        </div>
        <div style="display: flex; justify-content: space-between; align-items: center">
          <n-text>面包屑</n-text>
          <n-switch
            :value="setting.showBreadcrumb"
            @update:value="updateSetting({ showBreadcrumb: $event })"
          />
        </div>
        <div style="display: flex; justify-content: space-between; align-items: center">
          <n-text>固定顶栏</n-text>
          <n-switch
            :value="setting.fixedHeader"
            @update:value="updateSetting({ fixedHeader: $event })"
          />
        </div>
      </div>
    </n-drawer-content>
  </n-drawer>
</template>
