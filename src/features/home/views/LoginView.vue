<script setup lang="ts">
import { NCard, NForm, NFormItem, NInput, NButton, NSpace, NSelect } from 'naive-ui'
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { loginByRole } from '@/features/auth/api'
import { useAuthStore } from '@/features/auth/store/useAuthStore'
import type { UserRole } from '@/features/auth/store/useAuthStore'

const router = useRouter()
const authStore = useAuthStore()
const loading = ref(false)
const formValue = ref({ username: '', role: 'admin' as UserRole })

const roleOptions = [
  { label: '管理员', value: 'admin' },
  { label: '编辑者', value: 'editor' },
  { label: '查看者', value: 'viewer' },
]

async function handleLogin() {
  loading.value = true
  try {
    const result = await loginByRole({ role: formValue.value.role })
    authStore.setSession(result)
    router.push('/dashboard')
  } catch (e) {
    console.error(e)
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="login-container">
    <n-card title="登录" class="login-card">
      <n-form :model="formValue">
        <n-form-item label="角色">
          <n-select v-model:value="formValue.role" :options="roleOptions" />
        </n-form-item>
        <n-form-item label="用户名">
          <n-input v-model:value="formValue.username" placeholder="请输入用户名" />
        </n-form-item>
      </n-form>
      <template #footer>
        <n-space justify="end">
          <n-button type="primary" :loading="loading" @click="handleLogin">登录</n-button>
        </n-space>
      </template>
    </n-card>
  </div>
</template>

<style scoped>
.login-container {
  display: grid;
  place-items: center;
  min-height: 100vh;
  background: var(--body-color);
}

.login-card {
  width: 400px;
}
</style>
