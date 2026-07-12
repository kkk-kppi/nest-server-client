import { ref, computed, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { dateEnUS, dateZhCN, enUS, zhCN } from 'naive-ui'

export type Locale = 'zh-CN' | 'en-US'

const STORAGE_KEY = 'app-locale'

function getStoredLocale(): Locale {
  const stored = localStorage.getItem(STORAGE_KEY)
  if (stored === 'zh-CN' || stored === 'en-US') return stored
  return 'zh-CN'
}

const locale = ref<Locale>(getStoredLocale())

export function useLocale() {
  const { locale: i18nLocale } = useI18n()

  const naiveLocale = computed(() => {
    return locale.value === 'zh-CN' ? zhCN : enUS
  })

  const naiveDateLocale = computed(() => {
    return locale.value === 'zh-CN' ? dateZhCN : dateEnUS
  })

  function setLocale(newLocale: Locale) {
    locale.value = newLocale
    i18nLocale.value = newLocale
    localStorage.setItem(STORAGE_KEY, newLocale)
    document.documentElement.lang = newLocale
  }

  watch(
    locale,
    (newLocale) => {
      i18nLocale.value = newLocale
      document.documentElement.lang = newLocale
    },
    { immediate: true },
  )

  return {
    locale,
    setLocale,
    naiveLocale,
    naiveDateLocale,
  }
}
