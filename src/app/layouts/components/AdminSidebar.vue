<script setup lang="ts">
import { useRouter, useRoute } from 'vue-router'

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
    <div class="sidebar-header">
      <span v-if="!collapsed">Admin System</span>
      <span v-else>AS</span>
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
  padding: var(--space-4);
  text-align: center;
  font-weight: var(--font-bold);
  font-size: var(--text-lg);
  white-space: nowrap;
  overflow: hidden;
}
</style>
