<script setup lang="ts">
import { NCard, NForm, NFormItem, NSelect, NButton, NIcon } from 'naive-ui'
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { GridOutline } from '@vicons/ionicons5'
import { loginByRole } from '@/features/auth/api'
import { useAuthStore } from '@/features/auth/store/useAuthStore'
import type { UserRole } from '@/features/auth/store/useAuthStore'

const router = useRouter()
const authStore = useAuthStore()
const loading = ref(false)
const loginError = ref('')
const formValue = ref({ role: 'admin' as UserRole })

const roleOptions = [
  { label: '管理员', value: 'admin' },
  { label: '编辑者', value: 'editor' },
  { label: '查看者', value: 'viewer' },
]

async function handleLogin() {
  loading.value = true
  loginError.value = ''
  try {
    const result = await loginByRole({ role: formValue.value.role })
    authStore.setSession(result)
    router.push('/dashboard')
  } catch (e) {
    loginError.value = e instanceof Error ? e.message : '登录失败'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="login-container">
    <!-- 左侧品牌区域 -->
    <div class="login-brand">
      <div class="brand-content">
        <n-icon :size="48" color="white">
          <GridOutline />
        </n-icon>
        <h1 class="brand-title">Admin System</h1>
        <p class="brand-description">现代化后台管理系统</p>
      </div>
    </div>

    <!-- 右侧登录表单 -->
    <div class="login-form-area">
      <n-card title="登录" class="login-card">
        <n-form :model="formValue" @submit.prevent="handleLogin">
          <n-form-item label="角色">
            <n-select v-model:value="formValue.role" :options="roleOptions" />
          </n-form-item>
        </n-form>
        <p v-if="loginError" class="login-error">{{ loginError }}</p>
        <template #footer>
          <n-button type="primary" block :loading="loading" @click="handleLogin"> 登录 </n-button>
        </template>
      </n-card>
    </div>
  </div>
</template>

<style scoped>
.login-container {
  display: flex;
  min-height: 100vh;
}

.login-brand {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-hover) 100%);
  color: white;
}

.brand-content {
  text-align: center;
}

.brand-title {
  font-size: 32px;
  font-weight: 700;
  margin: 16px 0 8px;
  color: white;
}

.brand-description {
  font-size: 16px;
  opacity: 0.9;
}

.login-form-area {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--bg-secondary);
}

.login-card {
  width: 400px;
  border-radius: var(--radius-2xl);
}

.login-error {
  color: var(--color-error);
  text-align: center;
  margin-top: 12px;
}

@media (max-width: 768px) {
  .login-container {
    flex-direction: column;
  }

  .login-brand {
    padding: 40px 20px;
  }

  .login-form-area {
    flex: 1;
    padding: 20px;
  }

  .login-card {
    width: 100%;
    max-width: 400px;
  }
}
</style>
