<script setup lang="ts">
defineProps<{
  error?: Error
  resetError?: () => void
}>()
</script>

<template>
  <main class="error-fallback">
    <h1>页面出错了</h1>
    <p>抱歉，页面渲染过程中发生了错误，请尝试刷新页面。</p>
    <details v-if="error">
      <summary>错误详情</summary>
      <pre>{{ error.message }}</pre>
    </details>
    <div class="actions">
      <button v-if="resetError" type="button" @click="resetError">重试</button>
      <router-link to="/">返回首页</router-link>
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
  color: var(--text-h);
}

p {
  margin: 1rem 0;
  color: var(--text);
}

details {
  margin: 1rem 0;
  text-align: left;
}

pre {
  padding: 1rem;
  background: var(--code-bg);
  border-radius: 4px;
  overflow-x: auto;
}

.actions {
  display: flex;
  gap: 1rem;
  margin-top: 1rem;
}

button {
  padding: 0.5rem 1rem;
  border: 1px solid var(--border);
  border-radius: 4px;
  background: transparent;
  color: var(--text-h);
  cursor: pointer;
}

button:hover {
  background: var(--accent-bg);
}

a {
  padding: 0.5rem 1rem;
  color: var(--accent);
  text-decoration: none;
}

a:hover {
  text-decoration: underline;
}
</style>
