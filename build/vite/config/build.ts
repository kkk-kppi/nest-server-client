type ChunkStrategy = 'balanced' | 'basic'

type PresetName = 'development' | 'test' | 'stage' | 'production' | 'prod'

interface BuildPreset {
  chunkStrategy: ChunkStrategy
  chunkSizeWarningLimit: number
  enableBundleReport: boolean
}

const BUILD_PRESETS: Record<PresetName, BuildPreset> = {
  development: {
    chunkStrategy: 'basic',
    chunkSizeWarningLimit: 300,
    enableBundleReport: false,
  },
  test: {
    chunkStrategy: 'balanced',
    chunkSizeWarningLimit: 300,
    enableBundleReport: true,
  },
  stage: {
    chunkStrategy: 'balanced',
    chunkSizeWarningLimit: 300,
    enableBundleReport: true,
  },
  production: {
    chunkStrategy: 'balanced',
    chunkSizeWarningLimit: 300,
    enableBundleReport: true,
  },
  prod: {
    chunkStrategy: 'balanced',
    chunkSizeWarningLimit: 300,
    enableBundleReport: true,
  },
}

function toPositiveNumber(input: string | undefined, fallback: number) {
  const value = Number(input)
  if (Number.isFinite(value) && value > 0) {
    return value
  }
  return fallback
}

function toBoolean(input: string | undefined) {
  if (input === 'true') {
    return true
  }
  if (input === 'false') {
    return false
  }
  return undefined
}

function resolvePreset(mode: string, envPreset: string | undefined): BuildPreset {
  if (envPreset && envPreset in BUILD_PRESETS) {
    return BUILD_PRESETS[envPreset as PresetName]
  }
  if (mode in BUILD_PRESETS) {
    return BUILD_PRESETS[mode as PresetName]
  }
  return BUILD_PRESETS.production
}

function resolveChunkStrategy(preset: BuildPreset, envStrategy: string | undefined): ChunkStrategy {
  if (envStrategy === 'balanced' || envStrategy === 'basic') {
    return envStrategy
  }
  return preset.chunkStrategy
}

function createManualChunksResolver(strategy: ChunkStrategy) {
  return (id: string) => {
    const normalizedId = id.replaceAll('\\', '/')
    if (!normalizedId.includes('/node_modules/')) {
      return undefined
    }
    if (strategy === 'basic') {
      return 'vendor'
    }
    if (normalizedId.includes('/msw/') || normalizedId.includes('/@mswjs/')) {
      return 'mock-vendor'
    }
    if (normalizedId.includes('/vue/')) {
      return 'framework-vue'
    }
    if (normalizedId.includes('/vue-router/') || normalizedId.includes('/pinia/')) {
      return 'framework-routing-state'
    }
    if (normalizedId.includes('/axios/')) {
      return 'framework-http'
    }
    return 'vendor'
  }
}

export function createBuildOptions(mode: string, env: Record<string, string>) {
  const preset = resolvePreset(mode, env.VITE_BUILD_PRESET)
  const strategy = resolveChunkStrategy(preset, env.VITE_CHUNK_STRATEGY)
  const chunkSizeWarningLimit = toPositiveNumber(
    env.VITE_CHUNK_WARNING_LIMIT_KIB,
    preset.chunkSizeWarningLimit,
  )
  return {
    modulePreload: false,
    chunkSizeWarningLimit,
    rollupOptions: {
      output: {
        manualChunks: createManualChunksResolver(strategy),
      },
    },
  }
}

export function resolveBuildRuntimeOptions(mode: string, env: Record<string, string>) {
  const preset = resolvePreset(mode, env.VITE_BUILD_PRESET)
  const enableBundleReport = toBoolean(env.VITE_ENABLE_BUNDLE_REPORT) ?? preset.enableBundleReport
  return {
    enableBundleReport,
    build: createBuildOptions(mode, env),
  }
}
