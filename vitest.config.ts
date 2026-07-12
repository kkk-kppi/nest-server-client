import path from 'node:path'
import vue from '@vitejs/plugin-vue'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
  },
  test: {
    environment: 'jsdom',
    include: ['src/**/*.test.ts', 'scripts/**/*.test.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html'],
      include: [
        'src/shared/pagination.ts',
        'src/shared/composables/useAsyncState.ts',
        'src/shared/composables/usePaginationState.ts',
        'src/shared/composables/useRoutePageQuery.ts',
        'src/shared/components/atoms/CounterButton.vue',
        'src/features/auth/permission.ts',
        'src/features/home/components/HomeHeroPanel.vue',
        'src/core/http/request.ts',
        'src/core/router/guards.ts',
        'src/core/router/dynamic.ts',
      ],
      thresholds: {
        lines: 80,
        statements: 80,
        functions: 80,
        branches: 80,
      },
    },
  },
})
