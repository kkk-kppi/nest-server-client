<script setup lang="ts">
import { computed } from 'vue'
import { isDev } from '@/core/config/env'

const props = defineProps<{
  error?: Error
  resetError?: () => void
}>()

// Generate a simple event ID for reference
const eventId = computed(() => {
  if (!props.error) return ''
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 6)
})

// Only show error details in development
const showErrorDetails = computed(() => isDev() && props.error)
</script>

<template>
  <main class="error-fallback">
    <h1>页面出错了</h1>
    <p>抱歉，页面渲染过程中发生了错误，请尝试刷新页面。</p>
    <p v-if="eventId" class="event-id">
      错误编号: <code>{{ eventId }}</code>
    </p>
    <details v-if="showErrorDetails">
      <summary>错误详情</summary>
      <pre>{{ error?.message }}</pre>
    </details>
    <div class="actions">
      <button v-if="resetError" type="button" @click="resetError">重试</button>
      <button type="button" @click="$router.push('/')">返回首页</button>
      <button type="button" @click="() => $router.go(0)">刷新页面</button>
    </div>
  </main>
</template>

<style scoped>
.error-fallback {
  display: grid;
  place-items: center;
  min-height: 100vh;
  padding: 2rem;
  text-align: center;
}

h1 {
  margin: 0;
  font-size: 2rem;
  color: var(--text-primary);
}

p {
  margin: 1rem 0;
  color: var(--text-secondary);
}

.event-id {
  font-size: 0.875rem;
  color: var(--text-tertiary);
}

.event-id code {
  padding: 0.25rem 0.5rem;
  background: var(--bg-tertiary);
  border-radius: 4px;
  font-family: monospace;
}

details {
  margin: 1rem 0;
  text-align: left;
}

pre {
  padding: 1rem;
  background: var(--bg-tertiary);
  border-radius: 4px;
  overflow-x: auto;
  font-size: 0.875rem;
}

.actions {
  display: flex;
  gap: 1rem;
  margin-top: 1rem;
  flex-wrap: wrap;
  justify-content: center;
}

button {
  padding: 0.5rem 1rem;
  border: 1px solid var(--border-light);
  border-radius: 4px;
  background: transparent;
  color: var(--text-primary);
  cursor: pointer;
  font-size: 0.875rem;
}

button:hover {
  background: var(--color-primary-light);
}
</style>
