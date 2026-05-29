<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()

const breadcrumbs = computed(() => {
  return route.matched
    .filter((r) => r.meta?.title)
    .map((r) => ({
      label: r.meta.title as string,
      path: r.path,
      name: r.name as string,
    }))
})

function handleClick(name: string) {
  if (name) router.push({ name })
}
</script>

<template>
  <n-breadcrumb>
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
