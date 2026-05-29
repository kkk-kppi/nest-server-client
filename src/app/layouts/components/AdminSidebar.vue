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
  <div style="display: flex; flex-direction: column; height: 100%">
    <div
      style="
        padding: 16px;
        text-align: center;
        font-weight: bold;
        font-size: 18px;
        white-space: nowrap;
        overflow: hidden;
      "
    >
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
  </div>
</template>
