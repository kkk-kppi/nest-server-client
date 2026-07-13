<script setup lang="ts">
import { RouterView } from 'vue-router'
import {
  NConfigProvider,
  NDialogProvider,
  NNotificationProvider,
  NMessageProvider,
  NLoadingBarProvider,
} from 'naive-ui'
import { useAuthStore } from '@/features/auth/store/useAuthStore'
import { useTheme } from '@/core/theme/useTheme'
import { lightThemeOverrides, darkThemeOverrides } from '@/core/theme'
import ErrorBoundary from '@/app/components/ErrorBoundary.vue'

const authStore = useAuthStore()
const { theme, isDark } = useTheme()
</script>

<template>
  <NConfigProvider
    :theme="theme"
    :theme-overrides="isDark ? darkThemeOverrides : lightThemeOverrides"
  >
    <NDialogProvider>
      <NNotificationProvider>
        <NMessageProvider>
          <NLoadingBarProvider>
            <ErrorBoundary>
              <div v-if="authStore.authNotice" class="auth-notice">
                <span>{{ authStore.authNotice }}</span>
                <button type="button" @click="authStore.clearAuthNotice()">关闭</button>
              </div>
              <RouterView />
            </ErrorBoundary>
          </NLoadingBarProvider>
        </NMessageProvider>
      </NNotificationProvider>
    </NDialogProvider>
  </NConfigProvider>
</template>

<style scoped>
.auth-notice {
  position: fixed;
  z-index: var(--z-tooltip);
  top: var(--space-3);
  left: 50%;
  transform: translateX(-50%);
  background: var(--color-error-light);
  color: var(--color-error);
  padding: var(--space-2) var(--space-3);
  border: 1px solid var(--color-error);
  border-radius: var(--radius-lg);
  display: flex;
  gap: var(--space-2);
}
</style>
