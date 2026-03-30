import path from 'node:path'
import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'
import {
  createBundleBudgetPlugin,
  createBundleReportPlugin,
  resolveBuildRuntimeOptions,
} from './build/vite'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const entryBudgetKib = Number(env.VITE_ENTRY_JS_BUDGET_KIB ?? 300)
  const asyncBudgetKib = Number(env.VITE_ASYNC_CHUNK_BUDGET_KIB ?? 300)
  const runtimeOptions = resolveBuildRuntimeOptions(mode, env)
  const plugins = [
    vue(),
    createBundleBudgetPlugin(entryBudgetKib, asyncBudgetKib),
    ...(runtimeOptions.enableBundleReport ? [createBundleReportPlugin()] : []),
  ]

  return {
    plugins,
    resolve: {
      alias: {
        '@': path.resolve(__dirname, 'src'),
      },
    },
    build: runtimeOptions.build,
    server: {
      proxy: {
        '/api': {
          target: env.VITE_API_BASE_URL,
          changeOrigin: true,
        },
      },
    },
  }
})
