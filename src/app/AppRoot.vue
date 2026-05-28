<script setup lang="ts">
import { RouterView } from 'vue-router'
import { useAuthStore } from '@/features/auth/store/useAuthStore'
import ErrorBoundary from '@/app/components/ErrorBoundary.vue'

const authStore = useAuthStore()
</script>

<template>
  <ErrorBoundary>
    <div
      v-if="authStore.authNotice"
      style="position: fixed; z-index: 20; top: 12px; left: 50%; transform: translateX(-50%); background: #fee; color: #900; padding: 8px 12px; border: 1px solid #f99; border-radius: 6px; display: flex; gap: 8px"
    >
      <span>{{ authStore.authNotice }}</span>
      <button type="button" @click="authStore.clearAuthNotice()">关闭</button>
    </div>
    <RouterView />
  </ErrorBoundary>
</template>
