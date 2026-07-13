<script setup lang="ts">
import { ref } from 'vue'
import AppPageLayout from '@/app/layouts/AppPageLayout.vue'
import HomeHeroPanel from '@/features/home/components/HomeHeroPanel.vue'
import { RouterLink } from 'vue-router'
import { loginByRole } from '@/features/auth/api'
import { useAuthStore } from '@/features/auth/store/useAuthStore'
import type { UserRole } from '@/features/auth/store/useAuthStore'

const authStore = useAuthStore()
const isSubmitting = ref(false)
const loginError = ref('')

function logout() {
  authStore.clearSession()
  authStore.clearAuthNotice()
}

async function loginBy(role: UserRole) {
  isSubmitting.value = true
  loginError.value = ''
  authStore.clearAuthNotice()
  try {
    const result = await loginByRole({ role })
    authStore.setSession(result)
  } catch (error) {
    loginError.value = error instanceof Error ? error.message : '登录失败'
  } finally {
    isSubmitting.value = false
  }
}
</script>

<template>
  <div class="home-container">
    <HomeHeroPanel />
    <AppPageLayout>
      <div class="button-group">
        <button type="button" :disabled="isSubmitting" @click="loginBy('viewer')">
          Login Viewer
        </button>
        <button type="button" :disabled="isSubmitting" @click="loginBy('admin')">
          Login Admin
        </button>
        <button type="button" :disabled="isSubmitting" @click="loginBy('editor')">
          Login Editor
        </button>
        <button type="button" @click="logout">Logout</button>
      </div>
      <div class="link-group">
        <RouterLink to="/workspace">Go Workspace</RouterLink>
        <RouterLink to="/admin">Go Admin</RouterLink>
      </div>
      <p v-if="loginError" class="login-error">{{ loginError }}</p>
    </AppPageLayout>
  </div>
</template>

<style scoped>
.home-container {
  padding-bottom: var(--space-6);
}

.button-group {
  display: flex;
  gap: var(--space-2);
  justify-content: center;
}

.link-group {
  display: flex;
  gap: var(--space-4);
  justify-content: center;
}

.login-error {
  text-align: center;
  color: var(--color-error);
}
</style>
