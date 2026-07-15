<script setup lang="ts">
import { ref, watchEffect } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()

interface TabItem {
  name: string
  title: string
  path: string
}

const tabs = ref<TabItem[]>([])
const activeTab = ref('')
const closedTabs = new Set<string>()

watchEffect(() => {
  const routeName = route.name as string
  const routeTitle = (route.meta?.title as string) || routeName

  if (routeName && !closedTabs.has(routeName) && !tabs.value.find((t) => t.name === routeName)) {
    tabs.value.push({ name: routeName, title: routeTitle, path: route.fullPath })
  }
  activeTab.value = routeName
})

function handleTabChange(name: string) {
  const tab = tabs.value.find((t) => t.name === name)
  if (tab) router.push(tab.path)
}

function handleClose(name: string) {
  if (tabs.value.length <= 1) return

  const index = tabs.value.findIndex((t) => t.name === name)
  if (index === -1) return

  tabs.value.splice(index, 1)
  closedTabs.add(name)

  if (name === activeTab.value) {
    const nextTab = tabs.value[Math.min(index, tabs.value.length - 1)]
    if (nextTab) router.push(nextTab.path)
  }
}
</script>

<template>
  <div class="admin-tabs-wrapper">
    <n-tabs
      :value="activeTab"
      type="card"
      class="admin-tabs"
      @update:value="handleTabChange"
      @close="handleClose"
    >
      <n-tab
        v-for="tab in tabs"
        :key="tab.name"
        :name="tab.name"
        :tab="tab.title"
        :closable="tabs.length > 1"
      />
    </n-tabs>
  </div>
</template>

<style scoped>
.admin-tabs-wrapper {
  background: var(--bg-primary);
  border-bottom: 1px solid var(--border-light);
  padding: 0 var(--space-4);
}

.admin-tabs :deep(.n-tabs-tab) {
  border: none !important;
  border-radius: 0 !important;
  padding: var(--space-2) var(--space-3) !important;
  margin: 0 !important;
  color: var(--text-secondary);
  transition: all var(--duration-fast);
  position: relative;
}

.admin-tabs :deep(.n-tabs-tab:hover) {
  color: var(--color-primary);
  background: transparent !important;
}

.admin-tabs :deep(.n-tabs-tab--active) {
  color: var(--color-primary);
  background: transparent !important;
  font-weight: 500;
}

.admin-tabs :deep(.n-tabs-tab--active::after) {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 2px;
  background: var(--color-primary);
  border-radius: 1px 1px 0 0;
}

.admin-tabs :deep(.n-tabs-tab .n-tabs-tab__close) {
  margin-left: var(--space-1);
  opacity: 0;
  transition: opacity var(--duration-fast);
}

.admin-tabs :deep(.n-tabs-tab:hover .n-tabs-tab__close) {
  opacity: 1;
}

.admin-tabs :deep(.n-tabs-tab--active .n-tabs-tab__close) {
  opacity: 0.6;
}

.admin-tabs :deep(.n-tabs-tab--active:hover .n-tabs-tab__close) {
  opacity: 1;
}

.admin-tabs :deep(.n-tabs-nav) {
  border-bottom: none !important;
}

.admin-tabs :deep(.n-tabs-tab-pad) {
  display: none !important;
}
</style>
