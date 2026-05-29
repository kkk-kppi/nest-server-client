import path from 'node:path'
import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'
import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'
import { NaiveUiResolver } from 'unplugin-vue-components/resolvers'
import {
  createBundleBudgetPlugin,
  createBundleReportPlugin,
  resolveBuildRuntimeOptions,
} from './build/vite'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const entryBudgetKib = Number(env.VITE_ENTRY_JS_BUDGET_KIB ?? 300)
  const asyncBudgetKib = Number(env.VITE_ASYNC_CHUNK_BUDGET_KIB ?? 500)
  const runtimeOptions = resolveBuildRuntimeOptions(mode, env)
  const plugins = [
    vue(),
    AutoImport({
      imports: [
        'vue',
        'vue-router',
        { 'naive-ui': ['useDialog', 'useMessage', 'useNotification', 'useLoadingBar'] },
      ],
      dts: 'src/auto-imports.d.ts',
    }),
    Components({
      resolvers: [NaiveUiResolver()],
      dts: 'src/components.d.ts',
    }),
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
