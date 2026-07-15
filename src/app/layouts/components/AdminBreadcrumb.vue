<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()

const breadcrumbs = computed(() => {
  const items = route.matched
    .filter((r) => r.meta?.title)
    .map((r) => ({
      label: r.meta.title as string,
      path: r.path,
      name: r.name as string,
    }))

  // Add home as first item if not already present
  if (items.length > 0 && items[0].name !== 'dashboard') {
    items.unshift({
      label: '首页',
      path: '/dashboard',
      name: 'dashboard',
    })
  }

  return items
})

function handleClick(name: string) {
  if (name) router.push({ name })
}
</script>

<template>
  <n-breadcrumb class="admin-breadcrumb">
    <n-breadcrumb-item
      v-for="(item, index) in breadcrumbs"
      :key="item.name"
      :clickable="index < breadcrumbs.length - 1"
      @click="handleClick(item.name)"
    >
      {{ item.label }}
    </n-breadcrumb-item>
  </n-breadcrumb>
</template>

<style scoped>
.admin-breadcrumb {
  font-size: var(--text-sm);
}

.admin-breadcrumb :deep(.n-breadcrumb-item__link) {
  color: var(--text-secondary);
  transition: color var(--duration-fast);
}

.admin-breadcrumb :deep(.n-breadcrumb-item__link:hover) {
  color: var(--color-primary);
}

.admin-breadcrumb :deep(.n-breadcrumb-item__separator) {
  color: var(--text-tertiary);
}

.admin-breadcrumb :deep(.n-breadcrumb-item:last-child .n-breadcrumb-item__link) {
  color: var(--text-primary);
  font-weight: 500;
}
</style>
