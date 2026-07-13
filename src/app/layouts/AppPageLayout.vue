<template>
  <main class="app-page-layout">
    <slot />
  </main>
</template>

<style scoped>
.app-page-layout {
  display: grid;
  gap: var(--space-3);
  justify-content: center;
}
</style>
