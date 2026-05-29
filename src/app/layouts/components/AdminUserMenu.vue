<script setup lang="ts">
import { h, type Component } from 'vue'
import { NIcon } from 'naive-ui'
import { PersonOutline, SettingsOutline, LogOutOutline } from '@vicons/ionicons5'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/features/auth/store/useAuthStore'

const router = useRouter()
const authStore = useAuthStore()

function renderIcon(icon: Component) {
  return () => h(NIcon, null, { default: () => h(icon) })
}

const options = [
  { label: '个人信息', key: 'profile', icon: renderIcon(PersonOutline) },
  { label: '系统设置', key: 'settings', icon: renderIcon(SettingsOutline) },
  { type: 'divider', key: 'd1' },
  { label: '退出登录', key: 'logout', icon: renderIcon(LogOutOutline) },
]

function handleSelect(key: string) {
  if (key === 'logout') {
    authStore.clearSession()
    router.push({ name: 'login' })
  }
}
</script>

<template>
  <n-dropdown :options="options" @select="handleSelect">
    <n-space align="center" style="cursor: pointer; padding: 0 8px">
      <n-avatar :size="32" round>U</n-avatar>
      <n-text>{{ authStore.roles[0] || 'User' }}</n-text>
    </n-space>
  </n-dropdown>
</template>
