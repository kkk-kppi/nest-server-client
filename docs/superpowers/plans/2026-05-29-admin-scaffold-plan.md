# 通用后台管理底座实施计划

> **For agentic workers:** Use superpowers:subagent-driven-development to implement this plan task-by-task.

**Goal:** 集成 Naive UI，搭建通用后台管理底座（布局/主题/路由/权限/组件/国际化），产出可复用的管理系统脚手架。

**Architecture:** 在现有分层架构基础上，新增 `src/core/i18n`、`src/core/theme`、`src/app/layouts/AdminLayout`、`src/features/system`、`src/shared/components/pro` 等模块。

**Tech Stack:** Vue 3, TypeScript, Vite, Naive UI, vue-i18n, @vicons/ionicons5, unplugin-auto-import

---

## 任务清单

- [ ] Task 1: Naive UI 集成 + 主题系统 + 布局设置
- [ ] Task 2: AdminLayout 布局（三种模式）
- [ ] Task 3: 路由改造 + 菜单联动
- [ ] Task 4: 登录页重构
- [ ] Task 5: 图标系统
- [ ] Task 6: 国际化
- [ ] Task 7: ProTable 通用表格
- [ ] Task 8: ProForm 通用表单
- [ ] Task 9: 系统管理 Mock API
- [ ] Task 10: 系统管理页面（用户/角色/字典）
- [ ] Task 11: SearchBar / DictTag / IconSelect
- [ ] Task 12: 数据字典缓存 store

---

## Task 1: Naive UI 集成 + 主题系统 + 布局设置

**目标:** 安装 Naive UI，配置按需引入，建立主题系统和布局设置基础。

**Files:**

- Modify: `package.json` (add dependencies)
- Modify: `vite.config.ts` (add unplugin-auto-import)
- Create: `src/core/theme/index.ts` (主题配置)
- Create: `src/core/theme/useTheme.ts` (亮/暗主题切换)
- Create: `src/core/theme/useLayoutSetting.ts` (布局配置持久化)
- Modify: `src/app/AppRoot.vue` (添加 n-config-provider)

### Step 1: 安装依赖

```bash
pnpm add naive-ui
pnpm add -D @vicons/ionicons5 unplugin-auto-import unplugin-vue-components
```

### Step 2: 配置 vite.config.ts 按需引入

```ts
import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'
import { NaiveUiResolver } from 'unplugin-vue-components/resolvers'

// 在 plugins 数组中添加:
AutoImport({
  imports: [
    'vue',
    'vue-router',
    { 'naive-ui': ['useDialog', 'useMessage', 'useNotification', 'useLoadingBar'] },
  ],
}),
Components({
  resolvers: [NaiveUiResolver()],
}),
```

### Step 3: 创建主题配置

Create `src/core/theme/index.ts`:

```ts
import { darkTheme, type GlobalThemeOverrides } from 'naive-ui'

export const lightThemeOverrides: GlobalThemeOverrides = {
  common: {
    primaryColor: '#18a058',
    primaryColorHover: '#36ad6a',
    primaryColorPressed: '#0c7a43',
    borderRadius: '6px',
  },
}

export const darkThemeOverrides: GlobalThemeOverrides = {
  common: {
    primaryColor: '#63e2b7',
    primaryColorHover: '#7fe7c4',
    primaryColorPressed: '#5acea7',
    borderRadius: '6px',
  },
}

export { darkTheme }
```

### Step 4: 创建 useTheme composable

Create `src/core/theme/useTheme.ts`:

```ts
import { ref, computed, watch } from 'vue'
import { darkTheme } from 'naive-ui'
import type { GlobalTheme } from 'naive-ui'

export type ThemeMode = 'light' | 'dark' | 'system'

const STORAGE_KEY = 'app-theme-mode'

function getStoredMode(): ThemeMode {
  const stored = localStorage.getItem(STORAGE_KEY)
  if (stored === 'light' || stored === 'dark' || stored === 'system') return stored
  return 'system'
}

const mode = ref<ThemeMode>(getStoredMode())
const systemDark = ref(window.matchMedia('(prefers-color-scheme: dark)').matches)

window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
  systemDark.value = e.matches
})

const isDark = computed(() => {
  if (mode.value === 'system') return systemDark.value
  return mode.value === 'dark'
})

const theme = computed<GlobalTheme | undefined>(() => (isDark.value ? darkTheme : undefined))

watch(
  isDark,
  (dark) => {
    document.documentElement.classList.toggle('dark', dark)
  },
  { immediate: true },
)

watch(mode, (m) => {
  localStorage.setItem(STORAGE_KEY, m)
})

export function useTheme() {
  return {
    mode,
    isDark,
    theme,
    setMode(m: ThemeMode) {
      mode.value = m
    },
    toggleDark() {
      mode.value = isDark.value ? 'light' : 'dark'
    },
  }
}
```

### Step 5: 创建 useLayoutSetting composable

Create `src/core/theme/useLayoutSetting.ts`:

```ts
import { ref, watch } from 'vue'

export type LayoutMode = 'side' | 'top' | 'mix'

interface LayoutSetting {
  mode: LayoutMode
  showTabs: boolean
  showBreadcrumb: boolean
  fixedHeader: boolean
  sidebarCollapsed: boolean
  sidebarWidth: number
}

const STORAGE_KEY = 'app-layout-setting'

const defaults: LayoutSetting = {
  mode: 'side',
  showTabs: true,
  showBreadcrumb: true,
  fixedHeader: true,
  sidebarCollapsed: false,
  sidebarWidth: 220,
}

function loadSetting(): LayoutSetting {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) return { ...defaults, ...JSON.parse(stored) }
  } catch {}
  return { ...defaults }
}

const setting = ref<LayoutSetting>(loadSetting())

watch(
  setting,
  (s) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(s))
  },
  { deep: true },
)

export function useLayoutSetting() {
  return {
    setting,
    setLayoutMode(mode: LayoutMode) {
      setting.value.mode = mode
    },
    toggleSidebar() {
      setting.value.sidebarCollapsed = !setting.value.sidebarCollapsed
    },
    updateSetting(partial: Partial<LayoutSetting>) {
      Object.assign(setting.value, partial)
    },
  }
}
```

### Step 6: 修改 AppRoot.vue

```vue
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
              <!-- existing content -->
              <div v-if="authStore.authNotice" ...>...</div>
              <RouterView />
            </ErrorBoundary>
          </NLoadingBarProvider>
        </NMessageProvider>
      </NNotificationProvider>
    </NDialogProvider>
  </NConfigProvider>
</template>
```

### Step 7: 运行验证

```bash
pnpm typecheck
pnpm test
```

### Step 8: Commit

```bash
git add .
git commit -m "feat: integrate Naive UI with theme system and layout settings"
```

---

## Task 2: AdminLayout 布局（三种模式）

**目标:** 实现管理后台主布局，支持侧边菜单/顶部菜单/混合菜单三种模式。

**Files:**

- Create: `src/app/layouts/AdminLayout.vue`
- Create: `src/app/layouts/components/AdminSidebar.vue`
- Create: `src/app/layouts/components/AdminTopbar.vue`
- Create: `src/app/layouts/components/AdminBreadcrumb.vue`
- Create: `src/app/layouts/components/AdminTabs.vue`
- Create: `src/app/layouts/components/AdminUserMenu.vue`
- Create: `src/app/layouts/components/AdminSettingPanel.vue`

### Step 1: 创建 AdminLayout.vue

主布局组件，根据 `useLayoutSetting().setting.mode` 渲染不同布局结构。

### Step 2: 创建 AdminSidebar.vue

- 使用 NMenu 渲染菜单
- 支持折叠/展开
- 菜单项从路由 meta 自动生成（Task 3 实现）

### Step 3: 创建 AdminTopbar.vue

- 折叠按钮
- 面包屑（侧边模式）或 顶部菜单（顶部/混合模式）
- 右侧工具栏：主题切换、全屏、语言切换、用户菜单、设置按钮

### Step 4: 创建辅助组件

- AdminBreadcrumb.vue: 面包屑导航
- AdminTabs.vue: 多标签页
- AdminUserMenu.vue: 用户下拉菜单（个人信息/退出登录）
- AdminSettingPanel.vue: NDrawer 布局设置面板

### Step 5: Commit

```bash
git commit -m "feat: implement AdminLayout with three layout modes"
```

---

## Task 3: 路由改造 + 菜单联动

**目标:** 改造路由结构，实现路由 meta 自动生成菜单。

**Files:**

- Modify: `src/core/router/routes.ts`
- Modify: `src/features/auth/dynamic-routes.ts`
- Modify: `src/core/router/guards.ts`
- Create: `src/app/layouts/composables/useMenuRoutes.ts`

### Step 1: 添加新路由

- `/login` → LoginView
- `/dashboard` → AdminLayout > DashboardView
- `/system/user` → AdminLayout > UserManageView
- `/system/role` → AdminLayout > RoleManageView
- `/system/dict` → AdminLayout > DictManageView

### Step 2: 实现 useMenuRoutes

从 router.getRoutes() 读取路由，过滤 hidden、按 order 排序、递归构建菜单树。

### Step 3: Commit

```bash
git commit -m "feat: restructure routes with menu auto-generation"
```

---

## Task 4: 登录页重构

**目标:** 用 Naive UI 重写登录页面。

**Files:**

- Create: `src/features/auth/views/LoginView.vue`
- Modify: `src/features/home/views/HomeView.vue` (简化或重定向)

### Step 1: 创建 LoginView.vue

- NForm 表单：用户名 + 密码 + 角色下拉选择
- 表单验证规则
- "记住我" 复选框
- 登录按钮 + loading 状态
- 居中布局

### Step 2: 修改 HomeView

简化为产品介绍页或重定向到 /login。

### Step 3: Commit

```bash
git commit -m "feat: refactor login page with Naive UI form"
```

---

## Task 5: 图标系统

**目标:** 集成 @vicons/ionicons5，建立图标使用体系。

**Files:**

- Create: `src/features/icons/index.ts`

### Step 1: 注册常用图标

### Step 2: Commit

```bash
git commit -m "feat: integrate icon system with @vicons/ionicons5"
```

---

## Task 6: 国际化

**目标:** 集成 vue-i18n，支持中英双语。

**Files:**

- Create: `src/core/i18n/index.ts`
- Create: `src/core/i18n/zh-CN.ts`
- Create: `src/core/i18n/en-US.ts`
- Modify: `src/app/bootstrap.ts` (安装 i18n)

### Step 1: 安装 vue-i18n

```bash
pnpm add vue-i18n
```

### Step 2: 创建 i18n 模块

### Step 3: 在 bootstrap.ts 中安装

### Step 4: Commit

```bash
git commit -m "feat: add vue-i18n with Chinese and English translations"
```

---

## Task 7: ProTable 通用表格

**目标:** 基于 NDataTable 封装通用管理后台表格组件。

**Files:**

- Create: `src/shared/components/pro/ProTable.vue`

### Step 1: 实现 ProTable

Props: columns, request, searchFields, pagination, toolbar, rowKey
功能: 自动请求、loading、分页、搜索栏、工具栏

### Step 2: Commit

```bash
git commit -m "feat: implement ProTable generic table component"
```

---

## Task 8: ProForm 通用表单

**目标:** 基于 NForm 封装通用表单组件。

**Files:**

- Create: `src/shared/components/pro/ProForm.vue`

### Step 1: 实现 ProForm

Props: fields, model, rules, layout
功能: 根据 fields 自动生成表单项

### Step 2: Commit

```bash
git commit -m "feat: implement ProForm generic form component"
```

---

## Task 9: 系统管理 Mock API

**目标:** 为系统管理模块提供 MSW mock 数据。

**Files:**

- Modify: `src/mocks/handlers.ts`
- Create: `src/features/system/api.ts`

### Step 1: 定义 system API endpoints

### Step 2: 添加 MSW handlers

用户/角色/字典的 CRUD mock。

### Step 3: Commit

```bash
git commit -m "feat: add system management mock API handlers"
```

---

## Task 10: 系统管理页面

**目标:** 实现用户管理、角色管理、字典管理页面。

**Files:**

- Create: `src/features/system/views/UserManageView.vue`
- Create: `src/features/system/views/RoleManageView.vue`
- Create: `src/features/system/views/DictManageView.vue`
- Create: `src/features/system/components/UserForm.vue`
- Create: `src/features/system/components/RoleForm.vue`
- Create: `src/features/system/components/DictForm.vue`

### Step 1-3: 依次实现三个页面

### Step 4: Commit

```bash
git commit -m "feat: implement system management pages (user/role/dict)"
```

---

## Task 11: SearchBar / DictTag / IconSelect

**目标:** 实现辅助通用组件。

**Files:**

- Create: `src/shared/components/pro/SearchBar.vue`
- Create: `src/shared/components/pro/DictTag.vue`
- Create: `src/shared/components/pro/IconSelect.vue`

### Step 1-3: 依次实现三个组件

### Step 4: Commit

```bash
git commit -m "feat: implement SearchBar, DictTag, and IconSelect components"
```

---

## Task 12: 数据字典缓存 store

**目标:** 实现字典数据缓存，提供全局字典查询能力。

**Files:**

- Create: `src/features/system/store/useDictStore.ts`
- Create: `src/shared/utils/dict.ts`

### Step 1: 实现 useDictStore

### Step 2: 实现字典工具函数

### Step 3: Commit

```bash
git commit -m "feat: implement dictionary cache store and utilities"
```

---

## 最终验证

```bash
pnpm lint
pnpm typecheck
pnpm test
pnpm build
```
