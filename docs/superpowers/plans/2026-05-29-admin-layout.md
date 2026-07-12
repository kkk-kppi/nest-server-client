# AdminLayout Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement admin dashboard layout with sidebar, topbar, and three layout modes (side, top, mix).

**Architecture:** Vue 3 composition API components using Naive UI layout primitives, integrated with existing `useLayoutSetting` and `useTheme` composables.

**Tech Stack:** Vue 3, TypeScript, Naive UI, @vicons/ionicons5, vue-router

---

## File Structure

```
src/app/layouts/
├── AdminLayout.vue           # Main layout container with three modes
├── components/
│   ├── AdminSidebar.vue      # Side navigation menu
│   ├── AdminTopbar.vue       # Top navigation bar
│   ├── AdminBreadcrumb.vue   # Route breadcrumb navigation
│   ├── AdminTabs.vue         # Multi-tab page management
│   ├── AdminUserMenu.vue     # User avatar dropdown menu
│   └── AdminSettingPanel.vue # Layout settings drawer
```

## Key Dependencies

- `@/core/theme/useLayoutSetting` - Layout mode and settings
- `@/core/theme/useTheme` - Theme mode (light/dark)
- `@/features/auth/store/useAuthStore` - Auth state and logout
- `vue-router` - Route information for breadcrumbs and tabs
- `@vicons/ionicons5` - Icon components

---

### Task 1: Create AdminBreadcrumb.vue

**Files:**

- Create: `src/app/layouts/components/AdminBreadcrumb.vue`

- [ ] **Step 1: Create AdminBreadcrumb component**

```vue
<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { NBreadcrumb, NBreadcrumbItem } from 'naive-ui'

const route = useRoute()
const router = useRouter()

const breadcrumbs = computed(() => {
  const matched = route.matched.filter((item) => item.meta?.title)
  return matched.map((item) => ({
    title: item.meta.title as string,
    path: item.path,
    isCurrent: item.path === route.path,
  }))
})

function handleClick(path: string) {
  if (path !== route.path) {
    router.push(path)
  }
}
</script>

<template>
  <NBreadcrumb v-if="breadcrumbs.length > 0">
    <NBreadcrumbItem
      v-for="(item, index) in breadcrumbs"
      :key="index"
      :clickable="!item.isCurrent"
      @click="handleClick(item.path)"
    >
      {{ item.title }}
    </NBreadcrumbItem>
  </NBreadcrumb>
</template>
```

- [ ] **Step 2: Verify file was created**

Run: `Get-Content src\app\layouts\components\AdminBreadcrumb.vue`
Expected: File content displayed without errors

- [ ] **Step 3: Commit**

```bash
git add src/app/layouts/components/AdminBreadcrumb.vue
git commit -m "feat(layout): add AdminBreadcrumb component"
```

---

### Task 2: Create AdminUserMenu.vue

**Files:**

- Create: `src/app/layouts/components/AdminUserMenu.vue`

- [ ] **Step 1: Create AdminUserMenu component**

```vue
<script setup lang="ts">
import { h } from 'vue'
import { useRouter } from 'vue-router'
import { NDropdown, NAvatar, NText } from 'naive-ui'
import { PersonOutline, SettingsOutline, LogOutOutline } from '@vicons/ionicons5'
import { useAuthStore } from '@/features/auth/store/useAuthStore'
import { NIcon } from 'naive-ui'

const router = useRouter()
const authStore = useAuthStore()

function renderIcon(icon: any) {
  return () => h(NIcon, null, { default: () => h(icon) })
}

const options = [
  {
    label: '个人资料',
    key: 'profile',
    icon: renderIcon(PersonOutline),
  },
  {
    label: '系统设置',
    key: 'settings',
    icon: renderIcon(SettingsOutline),
  },
  {
    type: 'divider',
    key: 'd1',
  },
  {
    label: '退出登录',
    key: 'logout',
    icon: renderIcon(LogOutOutline),
  },
]

function handleSelect(key: string | number) {
  switch (key) {
    case 'profile':
      router.push('/profile')
      break
    case 'settings':
      router.push('/settings')
      break
    case 'logout':
      authStore.clearSession()
      router.push('/login')
      break
  }
}
</script>

<template>
  <NDropdown :options="options" @select="handleSelect">
    <div class="user-menu-trigger">
      <NAvatar :size="28" round>
        {{ authStore.roles?.[0]?.charAt(0)?.toUpperCase() || 'U' }}
      </NAvatar>
      <NText class="username">{{ authStore.roles?.[0] || 'User' }}</NText>
    </div>
  </NDropdown>
</template>

<style scoped>
.user-menu-trigger {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  padding: 0 8px;
}

.username {
  font-size: 14px;
}
</style>
```

- [ ] **Step 2: Verify file was created**

Run: `Get-Content src\app\layouts\components\AdminUserMenu.vue`
Expected: File content displayed without errors

- [ ] **Step 3: Commit**

```bash
git add src/app/layouts/components/AdminUserMenu.vue
git commit -m "feat(layout): add AdminUserMenu component"
```

---

### Task 3: Create AdminTabs.vue

**Files:**

- Create: `src/app/layouts/components/AdminTabs.vue`

- [ ] **Step 1: Create AdminTabs component**

```vue
<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { NTabs, NTabPane, NIcon } from 'naive-ui'
import { CloseCircleOutline } from '@vicons/ionicons5'

interface TabItem {
  name: string
  title: string
  path: string
  closable: boolean
}

const route = useRoute()
const router = useRouter()

const tabs = ref<TabItem[]>([
  {
    name: 'dashboard',
    title: '首页',
    path: '/admin/dashboard',
    closable: false,
  },
])

const activeTab = computed(() => route.path)

function addTab() {
  const { path, meta } = route
  const exists = tabs.value.some((tab) => tab.path === path)
  if (!exists && meta?.title) {
    tabs.value.push({
      name: path,
      title: meta.title as string,
      path,
      closable: path !== '/admin/dashboard',
    })
  }
}

function handleTabChange(path: string) {
  router.push(path)
}

function handleClose(path: string) {
  const index = tabs.value.findIndex((tab) => tab.path === path)
  if (index === -1) return

  tabs.value.splice(index, 1)

  if (path === route.path) {
    const nextTab = tabs.value[index] || tabs.value[index - 1]
    if (nextTab) {
      router.push(nextTab.path)
    }
  }
}

watch(() => route.path, addTab, { immediate: true })
</script>

<template>
  <div class="admin-tabs">
    <NTabs :value="activeTab" type="card" @update:value="handleTabChange">
      <NTabPane
        v-for="tab in tabs"
        :key="tab.path"
        :name="tab.path"
        :tab="tab.title"
        :closable="tab.closable"
        display-directive="show:lazy"
      >
        <template #tab>
          <span>{{ tab.title }}</span>
          <NIcon v-if="tab.closable" class="tab-close-icon" @click.stop="handleClose(tab.path)">
            <CloseCircleOutline />
          </NIcon>
        </template>
      </NTabPane>
    </NTabs>
  </div>
</template>

<style scoped>
.admin-tabs {
  padding: 4px 16px 0;
  background: var(--n-color);
}

.tab-close-icon {
  margin-left: 4px;
  cursor: pointer;
  opacity: 0.6;
}

.tab-close-icon:hover {
  opacity: 1;
}
</style>
```

- [ ] **Step 2: Verify file was created**

Run: `Get-Content src\app\layouts\components\AdminTabs.vue`
Expected: File content displayed without errors

- [ ] **Step 3: Commit**

```bash
git add src/app/layouts/components/AdminTabs.vue
git commit -m "feat(layout): add AdminTabs component"
```

---

### Task 4: Create AdminSidebar.vue

**Files:**

- Create: `src/app/layouts/components/AdminSidebar.vue`

- [ ] **Step 1: Create AdminSidebar component**

```vue
<script setup lang="ts">
import { h, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { NLayoutSider, NMenu, NIcon, NText } from 'naive-ui'
import { HomeOutline, SettingsOutline, PeopleOutline } from '@vicons/ionicons5'
import type { MenuOption } from 'naive-ui'

const props = defineProps<{
  collapsed: boolean
  width?: number
}>()

const route = useRoute()
const router = useRouter()

function renderIcon(icon: any) {
  return () => h(NIcon, null, { default: () => h(icon) })
}

const menuOptions: MenuOption[] = [
  {
    label: '首页',
    key: '/admin/dashboard',
    icon: renderIcon(HomeOutline),
  },
  {
    label: '用户管理',
    key: '/admin/users',
    icon: renderIcon(PeopleOutline),
  },
  {
    label: '系统设置',
    key: '/admin/settings',
    icon: renderIcon(SettingsOutline),
  },
]

const activeKey = computed(() => route.path)

function handleMenuSelect(key: string) {
  router.push(key)
}
</script>

<template>
  <NLayoutSider
    :collapsed="collapsed"
    :width="width || 220"
    :collapsed-width="64"
    show-trigger
    collapse-mode="width"
    :native-scrollbar="false"
    bordered
  >
    <div class="sidebar-logo">
      <NText strong v-if="!collapsed">Admin Panel</NText>
      <NText strong v-else>AP</NText>
    </div>
    <NMenu
      :collapsed="collapsed"
      :collapsed-width="64"
      :collapsed-icon-size="22"
      :options="menuOptions"
      :value="activeKey"
      @update:value="handleMenuSelect"
    />
  </NLayoutSider>
</template>

<style scoped>
.sidebar-logo {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 64px;
  font-size: 18px;
  border-bottom: 1px solid var(--n-border-color);
}
</style>
```

- [ ] **Step 2: Verify file was created**

Run: `Get-Content src\app\layouts\components\AdminSidebar.vue`
Expected: File content displayed without errors

- [ ] **Step 3: Commit**

```bash
git add src/app/layouts/components/AdminSidebar.vue
git commit -m "feat(layout): add AdminSidebar component"
```

---

### Task 5: Create AdminTopbar.vue

**Files:**

- Create: `src/app/layouts/components/AdminTopbar.vue`

- [ ] **Step 1: Create AdminTopbar component**

```vue
<script setup lang="ts">
import { h, computed } from 'vue'
import { NLayoutHeader, NButton, NIcon, NSpace, NTooltip } from 'naive-ui'
import {
  MenuOutline,
  SunnyOutline,
  MoonOutline,
  ExpandOutline,
  ContractOutline,
  SettingsOutline,
} from '@vicons/ionicons5'
import { useLayoutSetting, type LayoutMode } from '@/core/theme/useLayoutSetting'
import { useTheme } from '@/core/theme/useTheme'
import AdminBreadcrumb from './AdminBreadcrumb.vue'
import AdminUserMenu from './AdminUserMenu.vue'

const props = defineProps<{
  layoutMode: LayoutMode
}>()

const emit = defineEmits<{
  toggleSidebar: []
  openSettings: []
}>()

const { setting } = useLayoutSetting()
const { isDark, toggleDark } = useTheme()

const isFullscreen = ref(false)

function toggleFullscreen() {
  if (!document.fullscreenElement) {
    document.documentElement.requestFullscreen()
    isFullscreen.value = true
  } else {
    document.exitFullscreen()
    isFullscreen.value = false
  }
}

function renderIcon(icon: any) {
  return () => h(NIcon, null, { default: () => h(icon) })
}
</script>

<template>
  <NLayoutHeader bordered class="admin-topbar">
    <div class="topbar-left">
      <NButton
        v-if="layoutMode === 'side' || layoutMode === 'mix'"
        quaternary
        @click="emit('toggleSidebar')"
      >
        <template #icon>
          <NIcon>
            <MenuOutline />
          </NIcon>
        </template>
      </NButton>
      <AdminBreadcrumb v-if="setting.showBreadcrumb" />
    </div>

    <NSpace class="topbar-right" align="center" :size="8">
      <NTooltip trigger="hover">
        <template #trigger>
          <NButton quaternary @click="toggleDark">
            <template #icon>
              <NIcon>
                <SunnyOutline v-if="isDark" />
                <MoonOutline v-else />
              </NIcon>
            </template>
          </NButton>
        </template>
        {{ isDark ? '切换亮色' : '切换暗色' }}
      </NTooltip>

      <NTooltip trigger="hover">
        <template #trigger>
          <NButton quaternary @click="toggleFullscreen">
            <template #icon>
              <NIcon>
                <ContractOutline v-if="isFullscreen" />
                <ExpandOutline v-else />
              </NIcon>
            </template>
          </NButton>
        </template>
        {{ isFullscreen ? '退出全屏' : '全屏' }}
      </NTooltip>

      <NTooltip trigger="hover">
        <template #trigger>
          <NButton quaternary @click="emit('openSettings')">
            <template #icon>
              <NIcon>
                <SettingsOutline />
              </NIcon>
            </template>
          </NButton>
        </template>
        系统设置
      </NTooltip>

      <AdminUserMenu />
    </NSpace>
  </NLayoutHeader>
</template>

<style scoped>
.admin-topbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 64px;
  padding: 0 24px;
}

.topbar-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.topbar-right {
  display: flex;
  align-items: center;
}
</style>
```

- [ ] **Step 2: Verify file was created**

Run: `Get-Content src\app\layouts\components\AdminTopbar.vue`
Expected: File content displayed without errors

- [ ] **Step 3: Commit**

```bash
git add src/app/layouts/components/AdminTopbar.vue
git commit -m "feat(layout): add AdminTopbar component"
```

---

### Task 6: Create AdminSettingPanel.vue

**Files:**

- Create: `src/app/layouts/components/AdminSettingPanel.vue`

- [ ] **Step 1: Create AdminSettingPanel component**

```vue
<script setup lang="ts">
import { h } from 'vue'
import {
  NDrawer,
  NDrawerContent,
  NSpace,
  NText,
  NButton,
  NIcon,
  NSwitch,
  NDivider,
  NRadioButton,
  NRadioGroup,
} from 'naive-ui'
import {
  PhonePortraitOutline,
  TabletPortraitOutline,
  DesktopOutline,
  SunnyOutline,
  MoonOutline,
  ContrastOutline,
} from '@vicons/ionicons5'
import { useLayoutSetting, type LayoutMode } from '@/core/theme/useLayoutSetting'
import { useTheme, type ThemeMode } from '@/core/theme/useTheme'

const props = defineProps<{
  show: boolean
}>()

const emit = defineEmits<{
  close: []
}>()

const { setting, setLayoutMode, updateSetting } = useLayoutSetting()
const { mode: themeMode, setMode } = useTheme()

function renderIcon(icon: any) {
  return () => h(NIcon, null, { default: () => h(icon) })
}

const layoutModes: { label: string; value: LayoutMode; icon: any }[] = [
  { label: '侧边菜单', value: 'side', icon: PhonePortraitOutline },
  { label: '顶部菜单', value: 'top', icon: TabletPortraitOutline },
  { label: '混合菜单', value: 'mix', icon: DesktopOutline },
]

const themeModes: { label: string; value: ThemeMode; icon: any }[] = [
  { label: '亮色', value: 'light', icon: SunnyOutline },
  { label: '暗色', value: 'dark', icon: MoonOutline },
  { label: '跟随系统', value: 'system', icon: ContrastOutline },
]
</script>

<template>
  <NDrawer :show="show" :width="320" @update:show="emit('close')">
    <NDrawerContent title="系统设置">
      <NSpace vertical :size="24">
        <div>
          <NText strong>布局模式</NText>
          <NRadioGroup
            :value="setting.mode"
            @update:value="setLayoutMode"
            class="setting-radio-group"
          >
            <NRadioButton v-for="item in layoutModes" :key="item.value" :value="item.value">
              <NIcon :size="16" :component="item.icon" />
              <span style="margin-left: 4px">{{ item.label }}</span>
            </NRadioButton>
          </NRadioGroup>
        </div>

        <NDivider />

        <div>
          <NText strong>主题模式</NText>
          <NRadioGroup :value="themeMode" @update:value="setMode" class="setting-radio-group">
            <NRadioButton v-for="item in themeModes" :key="item.value" :value="item.value">
              <NIcon :size="16" :component="item.icon" />
              <span style="margin-left: 4px">{{ item.label }}</span>
            </NRadioButton>
          </NRadioGroup>
        </div>

        <NDivider />

        <div>
          <NText strong>功能开关</NText>
          <div class="setting-switches">
            <div class="switch-item">
              <NText>显示标签页</NText>
              <NSwitch
                :value="setting.showTabs"
                @update:value="(val) => updateSetting({ showTabs: val })"
              />
            </div>
            <div class="switch-item">
              <NText>显示面包屑</NText>
              <NSwitch
                :value="setting.showBreadcrumb"
                @update:value="(val) => updateSetting({ showBreadcrumb: val })"
              />
            </div>
            <div class="switch-item">
              <NText>固定头部</NText>
              <NSwitch
                :value="setting.fixedHeader"
                @update:value="(val) => updateSetting({ fixedHeader: val })"
              />
            </div>
          </div>
        </div>
      </NSpace>
    </NDrawerContent>
  </NDrawer>
</template>

<style scoped>
.setting-radio-group {
  display: flex;
  gap: 8px;
  margin-top: 12px;
}

.setting-switches {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-top: 12px;
}

.switch-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
}
</style>
```

- [ ] **Step 2: Verify file was created**

Run: `Get-Content src\app\layouts\components\AdminSettingPanel.vue`
Expected: File content displayed without errors

- [ ] **Step 3: Commit**

```bash
git add src/app/layouts/components/AdminSettingPanel.vue
git commit -m "feat(layout): add AdminSettingPanel component"
```

---

### Task 7: Create AdminLayout.vue

**Files:**

- Create: `src/app/layouts/AdminLayout.vue`

- [ ] **Step 1: Create AdminLayout component**

```vue
<script setup lang="ts">
import { ref, computed } from 'vue'
import { RouterView } from 'vue-router'
import { NLayout, NLayoutContent, NLayoutHeader } from 'naive-ui'
import { useLayoutSetting } from '@/core/theme/useLayoutSetting'
import AdminSidebar from './components/AdminSidebar.vue'
import AdminTopbar from './components/AdminTopbar.vue'
import AdminTabs from './components/AdminTabs.vue'
import AdminSettingPanel from './components/AdminSettingPanel.vue'

const { setting, toggleSidebar } = useLayoutSetting()

const showSettings = ref(false)

const showSidebar = computed(() => {
  return setting.value.mode === 'side' || setting.value.mode === 'mix'
})

const sidebarWidth = computed(() => {
  return setting.value.sidebarCollapsed ? 64 : setting.value.sidebarWidth
})
</script>

<template>
  <NLayout has-sider class="admin-layout">
    <AdminSidebar
      v-if="showSidebar"
      :collapsed="setting.sidebarCollapsed"
      :width="setting.sidebarWidth"
    />

    <NLayout>
      <NLayoutHeader v-if="setting.fixedHeader" bordered class="admin-header">
        <AdminTopbar
          :layout-mode="setting.mode"
          @toggle-sidebar="toggleSidebar"
          @open-settings="showSettings = true"
        />
        <AdminTabs v-if="setting.showTabs" />
      </NLayoutHeader>

      <template v-else>
        <AdminTopbar
          :layout-mode="setting.mode"
          @toggle-sidebar="toggleSidebar"
          @open-settings="showSettings = true"
        />
        <AdminTabs v-if="setting.showTabs" />
      </template>

      <NLayoutContent
        :native-scrollbar="false"
        :style="{ height: setting.fixedHeader ? 'calc(100vh - 64px)' : 'auto' }"
        class="admin-content"
      >
        <RouterView v-slot="{ Component, route }">
          <Transition name="fade" mode="out-in">
            <KeepAlive>
              <component :is="Component" :key="route.path" />
            </KeepAlive>
          </Transition>
        </RouterView>
      </NLayoutContent>
    </NLayout>

    <AdminSettingPanel :show="showSettings" @close="showSettings = false" />
  </NLayout>
</template>

<style scoped>
.admin-layout {
  height: 100vh;
}

.admin-header {
  position: sticky;
  top: 0;
  z-index: 10;
}

.admin-content {
  padding: 16px;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
```

- [ ] **Step 2: Verify file was created**

Run: `Get-Content src\app\layouts\AdminLayout.vue`
Expected: File content displayed without errors

- [ ] **Step 3: Commit**

```bash
git add src/app/layouts/AdminLayout.vue
git commit -m "feat(layout): add AdminLayout component"
```

---

### Task 8: Typecheck and Final Verification

**Files:**

- None (verification only)

- [ ] **Step 1: Run typecheck**

Run: `pnpm typecheck`
Expected: No type errors

- [ ] **Step 2: Run lint**

Run: `pnpm lint`
Expected: No lint errors

- [ ] **Step 3: Run tests**

Run: `pnpm test`
Expected: All tests pass

- [ ] **Step 4: Final commit with all files**

```bash
git add src/app/layouts/
git commit -m "feat: implement AdminLayout with three layout modes"
```

---

## Summary

This plan creates 7 Vue components for the admin dashboard layout:

1. **AdminBreadcrumb** - Route-based breadcrumb navigation
2. **AdminUserMenu** - User avatar dropdown with logout
3. **AdminTabs** - Multi-tab page management
4. **AdminSidebar** - Side navigation with menu items
5. **AdminTopbar** - Top bar with controls and user menu
6. **AdminSettingPanel** - Layout and theme settings drawer
7. **AdminLayout** - Main layout container with three modes

Each component is self-contained, uses Naive UI primitives, and integrates with existing composables for layout settings and theme management.
