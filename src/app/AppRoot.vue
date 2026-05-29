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
              <div
                v-if="authStore.authNotice"
                style="
                  position: fixed;
                  z-index: 20;
                  top: 12px;
                  left: 50%;
                  transform: translateX(-50%);
                  background: #fee;
                  color: #900;
                  padding: 8px 12px;
                  border: 1px solid #f99;
                  border-radius: 6px;
                  display: flex;
                  gap: 8px;
                "
              >
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
