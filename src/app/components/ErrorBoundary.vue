<script setup lang="ts">
import { ref, onErrorCaptured, provide } from 'vue'
import ErrorFallbackView from '@/app/views/ErrorFallbackView.vue'

const error = ref<Error | null>(null)

function resetError() {
  error.value = null
}

provide('resetError', resetError)

onErrorCaptured((err) => {
  error.value = err
  return false
})
</script>

<template>
  <ErrorFallbackView v-if="error" :error="error" :reset-error="resetError" />
  <slot v-else />
</template>
