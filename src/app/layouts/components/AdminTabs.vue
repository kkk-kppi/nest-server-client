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

watchEffect(() => {
  const routeName = route.name as string
  const routeTitle = (route.meta?.title as string) || routeName

  if (routeName && !tabs.value.find((t) => t.name === routeName)) {
    tabs.value.push({ name: routeName, title: routeTitle, path: route.fullPath })
  }
  activeTab.value = routeName
})

function handleTabChange(name: string) {
  const tab = tabs.value.find((t) => t.name === name)
  if (tab) router.push(tab.path)
}

function handleClose(name: string) {
  const index = tabs.value.findIndex((t) => t.name === name)
  if (index === -1) return

  tabs.value.splice(index, 1)

  if (name === activeTab.value) {
    const nextTab = tabs.value[Math.min(index, tabs.value.length - 1)]
    if (nextTab) router.push(nextTab.path)
  }
}
</script>

<template>
  <n-tabs
    :value="activeTab"
    type="card"
    closable
    style="padding: 4px 0"
    @update:value="handleTabChange"
    @close="handleClose"
  >
    <n-tab v-for="tab in tabs" :key="tab.name" :name="tab.name" :tab="tab.title" />
  </n-tabs>
</template>
