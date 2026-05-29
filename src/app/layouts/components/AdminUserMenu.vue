<script setup lang="ts">
import { PersonOutline, SettingsOutline, LogOutOutline } from '@vicons/ionicons5'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/features/auth/store/useAuthStore'

const router = useRouter()
const authStore = useAuthStore()

const options = [
  { label: '个人信息', key: 'profile', icon: PersonOutline },
  { label: '系统设置', key: 'settings', icon: SettingsOutline },
  { type: 'divider', key: 'd1' },
  { label: '退出登录', key: 'logout', icon: LogOutOutline },
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
