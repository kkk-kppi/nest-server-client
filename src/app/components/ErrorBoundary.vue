<script setup lang="ts">
import { ref, onErrorCaptured, provide } from 'vue'
import ErrorFallbackView from '@/app/views/ErrorFallbackView.vue'
import { captureException } from '@/core/observability'

const error = ref<Error | null>(null)

function resetError() {
  error.value = null
}

provide('resetError', resetError)

onErrorCaptured((err) => {
  error.value = err
  captureException(err, { phase: 'error-boundary' })
  return false
})
</script>

<template>
  <ErrorFallbackView v-if="error" :error="error" :reset-error="resetError" />
  <slot v-else />
</template>
