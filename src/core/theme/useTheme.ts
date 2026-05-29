import { ref, computed, watch } from 'vue'
import { darkTheme } from 'naive-ui'
import type { GlobalTheme } from 'naive-ui'

export type ThemeMode = 'light' | 'dark' | 'system'

const STORAGE_KEY = 'app-theme-mode'

function getStoredMode(): ThemeMode {
  const stored = localStorage.getItem(STORAGE_KEY)
  if (stored === 'light' || stored === 'dark' || stored === 'system') return stored
  return 'system'
}

const mode = ref<ThemeMode>(getStoredMode())
const systemDark = ref(window.matchMedia('(prefers-color-scheme: dark)').matches)

window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
  systemDark.value = e.matches
})

const isDark = computed(() => {
  if (mode.value === 'system') return systemDark.value
  return mode.value === 'dark'
})

const theme = computed<GlobalTheme | undefined>(() => (isDark.value ? darkTheme : undefined))

watch(
  isDark,
  (dark) => {
    document.documentElement.classList.toggle('dark', dark)
  },
  { immediate: true },
)

watch(mode, (m) => {
  localStorage.setItem(STORAGE_KEY, m)
})

export function useTheme() {
  return {
    mode,
    isDark,
    theme,
    setMode(m: ThemeMode) {
      mode.value = m
    },
    toggleDark() {
      mode.value = isDark.value ? 'light' : 'dark'
    },
  }
}
