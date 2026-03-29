<script setup lang="ts">
defineProps<{
  label: string
}>()

const emit = defineEmits<{
  click: []
}>()
</script>

<template>
  <button class="counter" type="button" @click="emit('click')">
    {{ label }}
  </button>
</template>
