# UI 优化实施计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 对 nest-server-client 进行全面 UI 优化，采用现代简约风格，统一设计令牌，优化登录页、仪表盘、侧边栏等核心界面。

**Architecture:** 基于现有 Naive UI 组件库进行样式定制，统一设计令牌系统，优化各页面组件。采用渐进式改进策略，保持现有路由和权限系统不变。

**Tech Stack:** Vue 3 + TypeScript + Naive UI + Vite

---

## 文件结构

### 修改的文件

| 文件                                                 | 变更类型 | 说明                              |
| ---------------------------------------------------- | -------- | --------------------------------- |
| `src/styles/design-system-tokens.css`                | 删除     | 移除重复的设计令牌                |
| `src/styles/tokens.css`                              | 修改     | 移除导入，保留蓝色主题            |
| `src/core/theme/index.ts`                            | 修改     | 更新 Naive UI themeOverrides      |
| `src/style.css`                                      | 修改     | 添加滚动条、卡片 hover 等全局样式 |
| `src/app/AppRoot.vue`                                | 修改     | 添加页面切换动画                  |
| `src/app/layouts/components/AdminSidebar.vue`        | 修改     | 添加 Logo 图标                    |
| `src/features/home/views/LoginView.vue`              | 修改     | 重新设计登录页                    |
| `src/app/views/DashboardView.vue`                    | 修改     | 优化仪表盘布局                    |
| `src/features/home/views/HomeView.vue`               | 删除     | 未使用的残留代码                  |
| `src/features/home/components/HomeHeroPanel.vue`     | 删除     | 未使用的残留代码                  |
| `src/features/home/components/HomeHeroPanel.test.ts` | 删除     | 未使用的测试文件                  |

---

## Task 1: 设计令牌统一

**Files:**

- Delete: `src/styles/design-system-tokens.css`
- Modify: `src/styles/tokens.css`
- Modify: `src/core/theme/index.ts`

- [ ] **Step 1: 删除 design-system-tokens.css**

```bash
Remove-Item -LiteralPath "src/styles/design-system-tokens.css"
```

- [ ] **Step 2: 更新 tokens.css，移除导入**

修改 `src/styles/tokens.css`，删除第 8 行的导入语句：

```css
/* 删除这一行 */
@import './design-system-tokens.css';
```

- [ ] **Step 3: 更新 Naive UI themeOverrides**

修改 `src/core/theme/index.ts`：

```typescript
import { darkTheme, type GlobalThemeOverrides } from 'naive-ui'

export const lightThemeOverrides: GlobalThemeOverrides = {
  common: {
    primaryColor: '#2080f0',
    primaryColorHover: '#4098fc',
    primaryColorPressed: '#1060c9',
    primaryColorSuppl: '#4098fc',
    successColor: '#18a058',
    successColorHover: '#36ad6a',
    successColorPressed: '#0c7a3d',
    warningColor: '#f0a020',
    warningColorHover: '#fcb040',
    warningColorPressed: '#c97c00',
    errorColor: '#d03050',
    errorColorHover: '#de576d',
    errorColorPressed: '#ab1f3b',
    infoColor: '#2080f0',
    infoColorHover: '#4098fc',
    infoColorPressed: '#1060c9',
    borderRadius: '8px',
  },
  Card: {
    borderRadius: '12px',
  },
  Button: {
    borderRadius: '8px',
  },
}

export const darkThemeOverrides: GlobalThemeOverrides = {
  common: {
    primaryColor: '#4098fc',
    primaryColorHover: '#60b0ff',
    primaryColorPressed: '#2080f0',
    primaryColorSuppl: '#60b0ff',
    successColor: '#63e2b7',
    successColorHover: '#7fe7c4',
    successColorPressed: '#5acea7',
    warningColor: '#fcb040',
    warningColorHover: '#fcd070',
    warningColorPressed: '#f0a020',
    errorColor: '#de576d',
    errorColorHover: '#e8808f',
    errorColorPressed: '#d03050',
    infoColor: '#4098fc',
    infoColorHover: '#60b0ff',
    infoColorPressed: '#2080f0',
    borderRadius: '8px',
  },
  Card: {
    borderRadius: '12px',
  },
  Button: {
    borderRadius: '8px',
  },
}

export { darkTheme }
```

- [ ] **Step 4: 验证类型检查**

```bash
pnpm typecheck
```

Expected: 通过

- [ ] **Step 5: 提交**

```bash
git add src/styles/design-system-tokens.css src/styles/tokens.css src/core/theme/index.ts
git commit -m "refactor: unify design tokens, remove duplicate design-system-tokens.css"
```

---

## Task 2: 全局样式优化

**Files:**

- Modify: `src/style.css`
- Modify: `src/app/AppRoot.vue`

- [ ] **Step 1: 添加滚动条样式**

在 `src/style.css` 末尾添加：

```css
/* 自定义滚动条 */
::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}

::-webkit-scrollbar-track {
  background: transparent;
}

::-webkit-scrollbar-thumb {
  background: var(--border-base);
  border-radius: 3px;
}

::-webkit-scrollbar-thumb:hover {
  background: var(--border-dark);
}

/* 卡片 hover 效果 */
.n-card {
  transition: box-shadow 0.2s ease;
}

.n-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}
```

- [ ] **Step 2: 添加页面切换动画**

修改 `src/app/AppRoot.vue`，将 `<RouterView />` 替换为：

```vue
<router-view v-slot="{ Component }">
  <transition name="fade" mode="out-in">
    <component :is="Component" />
  </transition>
</router-view>
```

在 `<style scoped>` 中添加：

```css
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
```

- [ ] **Step 3: 验证类型检查**

```bash
pnpm typecheck
```

Expected: 通过

- [ ] **Step 4: 提交**

```bash
git add src/style.css src/app/AppRoot.vue
git commit -m "feat: add custom scrollbar, card hover effect, and page transition animation"
```

---

## Task 3: 侧边栏品牌标识

**Files:**

- Modify: `src/app/layouts/components/AdminSidebar.vue`

- [ ] **Step 1: 更新侧边栏组件**

修改 `src/app/layouts/components/AdminSidebar.vue`：

```vue
<script setup lang="ts">
import { useRouter, useRoute } from 'vue-router'
import { NIcon } from 'naive-ui'
import { GridOutline } from '@vicons/ionicons5'
import type { MenuOption } from 'naive-ui'

defineProps<{
  menuOptions: MenuOption[]
  collapsed: boolean
}>()

const router = useRouter()
const route = useRoute()

function handleMenuUpdate(key: string) {
  router.push({ name: key })
}
</script>

<template>
  <nav class="sidebar" role="navigation" aria-label="主导航">
    <div class="sidebar-header" @click="router.push('/dashboard')">
      <n-icon :size="28" color="var(--color-primary)">
        <GridOutline />
      </n-icon>
      <span v-if="!collapsed" class="sidebar-title">Admin System</span>
    </div>
    <n-menu
      :collapsed="collapsed"
      :collapsed-width="64"
      :collapsed-icon-size="22"
      :options="menuOptions"
      :value="route.name as string"
      @update:value="handleMenuUpdate"
    />
  </nav>
</template>

<style scoped>
.sidebar {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.sidebar-header {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: var(--space-4);
  cursor: pointer;
  transition: opacity var(--duration-fast);
}

.sidebar-header:hover {
  opacity: 0.8;
}

.sidebar-title {
  font-weight: 600;
  font-size: 16px;
  white-space: nowrap;
  color: var(--text-primary);
}
</style>
```

- [ ] **Step 2: 验证类型检查**

```bash
pnpm typecheck
```

Expected: 通过

- [ ] **Step 3: 提交**

```bash
git add src/app/layouts/components/AdminSidebar.vue
git commit -m "feat: add logo icon to sidebar with brand identity"
```

---

## Task 4: 登录页重新设计

**Files:**

- Modify: `src/features/home/views/LoginView.vue`

- [ ] **Step 1: 重新设计登录页**

修改 `src/features/home/views/LoginView.vue`：

```vue
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
const formValue = ref({ role: 'admin' as UserRole })

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
        <n-form :model="formValue">
          <n-form-item label="角色">
            <n-select v-model:value="formValue.role" :options="roleOptions" />
          </n-form-item>
        </n-form>
        <template #footer>
          <n-button type="primary" block :loading="loading" @click="handleLogin">
            登录
          </n-button>
        </template>
      </n-card>
    </div>
  </div>
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
  background: linear-gradient(135deg, #2080f0 0%, #4098fc 100%);
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
  background: #f5f7fa;
}

.login-card {
  width: 400px;
  border-radius: 16px;
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
```

- [ ] **Step 2: 验证类型检查**

```bash
pnpm typecheck
```

Expected: 通过

- [ ] **Step 3: 提交**

```bash
git add src/features/home/views/LoginView.vue
git commit -m "feat: redesign login page with brand identity and modern style"
```

---

## Task 5: 清理未使用的残留代码

**Files:**

- Delete: `src/features/home/views/HomeView.vue`
- Delete: `src/features/home/components/HomeHeroPanel.vue`
- Delete: `src/features/home/components/HomeHeroPanel.test.ts`

- [ ] **Step 1: 删除未使用的文件**

```bash
Remove-Item -LiteralPath "src/features/home/views/HomeView.vue"
Remove-Item -LiteralPath "src/features/home/components/HomeHeroPanel.vue"
Remove-Item -LiteralPath "src/features/home/components/HomeHeroPanel.test.ts"
```

- [ ] **Step 2: 验证构建**

```bash
pnpm typecheck
pnpm build
```

Expected: 通过

- [ ] **Step 3: 提交**

```bash
git add src/features/home/views/HomeView.vue src/features/home/components/HomeHeroPanel.vue src/features/home/components/HomeHeroPanel.test.ts
git commit -m "chore: remove unused HomeView and HomeHeroPanel components"
```

---

## Task 6: 仪表盘优化

**Files:**

- Modify: `src/app/views/DashboardView.vue`

- [ ] **Step 1: 优化仪表盘布局**

修改 `src/app/views/DashboardView.vue`：

```vue
<script setup lang="ts">
import {
  NCard,
  NGrid,
  NGi,
  NStatistic,
  NSpace,
  NIcon,
  NTag,
  NList,
  NListItem,
  NThing,
  NButton,
} from 'naive-ui'
import {
  PeopleOutline,
  EyeOutline,
  CartOutline,
  CashOutline,
  TrendingUpOutline,
  TimeOutline,
  CheckmarkCircleOutline,
  InformationCircleOutline,
  PersonOutline,
  FolderOpenOutline,
  SettingsOutline,
  DocumentTextOutline,
} from '@vicons/ionicons5'
import { useRouter } from 'vue-router'

const router = useRouter()

const quickLinks = [
  { title: '用户管理', icon: PeopleOutline, route: '/admin', color: 'var(--color-primary)' },
  {
    title: '工作空间',
    icon: FolderOpenOutline,
    route: '/workspace',
    color: 'var(--color-success)',
  },
  { title: '系统设置', icon: SettingsOutline, route: '/admin', color: 'var(--color-warning)' },
  { title: '审计日志', icon: DocumentTextOutline, route: '/admin', color: 'var(--color-info)' },
]

const recentActivities = [
  { id: 1, user: 'admin', action: '创建了新用户', time: '2分钟前', type: 'success' as const },
  { id: 2, user: 'editor', action: '发布了文章', time: '15分钟前', type: 'info' as const },
  { id: 3, user: 'admin', action: '修改了权限配置', time: '1小时前', type: 'warning' as const },
  { id: 4, user: 'viewer', action: '登录系统', time: '2小时前', type: 'info' as const },
]
</script>

<template>
  <n-space vertical :size="16">
    <!-- 欢迎区域 -->
    <n-card class="welcome-card">
      <div class="welcome-content">
        <div>
          <h2 class="welcome-title">欢迎回来，Admin</h2>
          <p class="welcome-date">
            今天是
            {{
              new Date().toLocaleDateString('zh-CN', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })
            }}
          </p>
        </div>
        <n-space>
          <n-button type="primary" @click="router.push('/admin')">用户管理</n-button>
          <n-button @click="router.push('/workspace')">工作空间</n-button>
        </n-space>
      </div>
    </n-card>

    <!-- 统计卡片 -->
    <n-grid :cols="4" :x-gap="16" :y-gap="16" responsive="screen" :item-responsive="true">
      <n-gi span="4 m:2 l:1">
        <n-card>
          <template #header-extra>
            <n-icon size="24" color="var(--color-primary)"><PeopleOutline /></n-icon>
          </template>
          <n-statistic label="用户总数" :value="1024">
            <template #suffix>
              <n-tag type="success" size="small" class="ml-2">+12%</n-tag>
            </template>
          </n-statistic>
        </n-card>
      </n-gi>
      <n-gi span="4 m:2 l:1">
        <n-card>
          <template #header-extra>
            <n-icon size="24" color="var(--color-success)"><EyeOutline /></n-icon>
          </template>
          <n-statistic label="今日访问" :value="56789">
            <template #suffix>
              <n-tag type="info" size="small" class="ml-2">+8%</n-tag>
            </template>
          </n-statistic>
        </n-card>
      </n-gi>
      <n-gi span="4 m:2 l:1">
        <n-card>
          <template #header-extra>
            <n-icon size="24" color="var(--color-warning)"><CartOutline /></n-icon>
          </template>
          <n-statistic label="订单数量" :value="256">
            <template #suffix>
              <n-tag type="warning" size="small" class="ml-2">+5%</n-tag>
            </template>
          </n-statistic>
        </n-card>
      </n-gi>
      <n-gi span="4 m:2 l:1">
        <n-card>
          <template #header-extra>
            <n-icon size="24" color="var(--color-error)"><CashOutline /></n-icon>
          </template>
          <n-statistic label="总收入">
            <template #default>
              <span class="text-error">¥123,456</span>
            </template>
            <template #suffix>
              <n-tag type="error" size="small" class="ml-2">+15%</n-tag>
            </template>
          </n-statistic>
        </n-card>
      </n-gi>
    </n-grid>

    <!-- 快捷入口 -->
    <n-grid :cols="4" :x-gap="16" responsive="screen" :item-responsive="true">
      <n-gi span="4 m:2 l:1" v-for="link in quickLinks" :key="link.title">
        <n-card class="quick-link-card" @click="router.push(link.route)">
          <div class="quick-link-content">
            <n-icon :size="32" :color="link.color">
              <component :is="link.icon" />
            </n-icon>
            <span class="quick-link-title">{{ link.title }}</span>
          </div>
        </n-card>
      </n-gi>
    </n-grid>

    <n-grid :cols="2" :x-gap="16" responsive="screen" :item-responsive="true">
      <!-- 欢迎信息 -->
      <n-gi span="4 m:2 l:1">
        <n-card title="系统信息">
          <template #header-extra>
            <n-icon size="20" color="var(--color-primary)"><InformationCircleOutline /></n-icon>
          </template>
          <n-space vertical :size="12">
            <p>
              这是一个通用后台管理系统底座，基于 <n-tag type="info" size="small">Vue 3</n-tag> +
              <n-tag type="success" size="small">TypeScript</n-tag> +
              <n-tag type="warning" size="small">Naive UI</n-tag> 构建。
            </p>
            <n-list bordered>
              <n-list-item>
                <n-thing title="用户管理" description="管理系统用户、角色和权限" />
              </n-list-item>
              <n-list-item>
                <n-thing title="工作空间" description="项目任务管理和协作" />
              </n-list-item>
              <n-list-item>
                <n-thing title="字典管理" description="系统配置和数据字典维护" />
              </n-list-item>
              <n-list-item>
                <n-thing title="审计日志" description="系统操作记录和追踪" />
              </n-list-item>
            </n-list>
          </n-space>
        </n-card>
      </n-gi>

      <!-- 最近活动 -->
      <n-gi span="4 m:2 l:1">
        <n-card title="最近活动">
          <template #header-extra>
            <n-icon size="20" color="var(--color-success)"><TimeOutline /></n-icon>
          </template>
          <n-list bordered>
            <n-list-item v-for="activity in recentActivities" :key="activity.id">
              <n-thing>
                <template #avatar>
                  <n-icon
                    size="20"
                    :color="
                      activity.type === 'success'
                        ? 'var(--color-success)'
                        : activity.type === 'warning'
                          ? 'var(--color-warning)'
                          : 'var(--color-primary)'
                    "
                  >
                    <CheckmarkCircleOutline v-if="activity.type === 'success'" />
                    <TrendingUpOutline v-else-if="activity.type === 'warning'" />
                    <InformationCircleOutline v-else />
                  </n-icon>
                </template>
                <template #header>
                  <span class="font-medium">{{ activity.user }}</span>
                </template>
                <template #description>
                  <span>{{ activity.action }}</span>
                  <n-tag :type="activity.type" size="small" class="ml-2">{{ activity.time }}</n-tag>
                </template>
              </n-thing>
            </n-list-item>
          </n-list>
        </n-card>
      </n-gi>
    </n-grid>
  </n-space>
</template>

<style scoped>
.welcome-card {
  background: linear-gradient(135deg, #2080f0 0%, #4098fc 100%);
}

.welcome-card :deep(.n-card__content) {
  color: white;
}

.welcome-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.welcome-title {
  font-size: 24px;
  font-weight: 600;
  margin: 0 0 4px;
  color: white;
}

.welcome-date {
  font-size: 14px;
  opacity: 0.9;
  margin: 0;
}

.quick-link-card {
  cursor: pointer;
  transition:
    box-shadow 0.2s ease,
    transform 0.2s ease;
}

.quick-link-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  transform: translateY(-2px);
}

.quick-link-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 8px 0;
}

.quick-link-title {
  font-size: 14px;
  font-weight: 500;
}

.text-error {
  color: var(--color-error);
}

@media (max-width: 767px) {
  .welcome-content {
    flex-direction: column;
    gap: 12px;
    text-align: center;
  }
}
</style>
```

- [ ] **Step 2: 验证类型检查**

```bash
pnpm typecheck
```

Expected: 通过

- [ ] **Step 3: 提交**

```bash
git add src/app/views/DashboardView.vue
git commit -m "feat: optimize dashboard with welcome area, quick links, and improved layout"
```

---

## 最终验证

- [ ] **Step 1: 运行完整验证**

```bash
pnpm typecheck
pnpm lint
pnpm build
```

Expected: 全部通过

- [ ] **Step 2: 运行测试**

```bash
pnpm test
```

Expected: 通过

- [ ] **Step 3: 最终提交**

```bash
git add -A
git commit -m "feat: complete UI optimization with modern minimalist style"
```
