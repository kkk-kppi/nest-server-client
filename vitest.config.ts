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
      include: ['src/**/*.{ts,vue}'],
      exclude: [
        'src/**/*.d.ts',
        'src/**/*.test.ts',
        'src/**/*.spec.ts',
        'src/**/*.stories.ts',
        'src/main.ts',
        'src/app/bootstrap.ts',
        'src/core/index.ts',
        'src/features/index.ts',
        'src/features/icons/index.ts',
        'src/core/store/index.ts',
        'src/core/i18n/index.ts',
        'src/core/theme/index.ts',
        'src/core/observability/index.ts',
        'src/core/router/index.ts',
        'src/core/http/index.ts',
        'src/shared/index.ts',
        'src/mocks/**',
        'src/env.d.ts',
      ],
      thresholds: {
        lines: 45,
        statements: 45,
        functions: 55,
        branches: 80,
      },
    },
  },
})
