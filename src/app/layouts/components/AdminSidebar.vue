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
    <div
      class="sidebar-header"
      role="link"
      aria-label="返回仪表盘"
      @click="router.push('/dashboard')"
    >
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

.sidebar-header:focus-visible {
  outline: 2px solid var(--color-primary);
  outline-offset: 2px;
}

.sidebar-title {
  font-weight: 600;
  font-size: 16px;
  white-space: nowrap;
  color: var(--text-primary);
}
</style>
