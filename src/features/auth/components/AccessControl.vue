<script setup lang="ts">
import { computed } from 'vue'
import { usePermission } from '../usePermission'
import type { UserRole } from '../store/useAuthStore'

interface Props {
  roles?: UserRole[]
  permissions?: string[]
  mode?: 'hide' | 'disabled'
}

const props = withDefaults(defineProps<Props>(), {
  roles: () => [],
  permissions: () => [],
  mode: 'hide',
})

const { hasRole, hasPermission } = usePermission()

const hasAccess = computed(() => {
  const rolePass = !props.roles.length || hasRole(props.roles)
  const permissionPass = !props.permissions.length || hasPermission(props.permissions)
  return rolePass && permissionPass
})
</script>

<template>
  <template v-if="mode === 'hide'">
    <slot v-if="hasAccess" />
  </template>
  <template v-else>
    <div :class="{ 'access-disabled': !hasAccess }" :aria-disabled="!hasAccess">
      <slot :has-access="hasAccess" />
    </div>
  </template>
</template>

<style scoped>
.access-disabled {
  opacity: 0.5;
  pointer-events: none;
}
</style>
