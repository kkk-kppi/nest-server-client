import { defineStore } from 'pinia'
import { ref } from 'vue'
import { getDictDataList } from '@/features/system/api'

interface DictItem {
  label: string
  value: string
}

interface DictState {
  items: DictItem[]
  loading: boolean
  error: string | null
}

export const useDictStore = defineStore('dict', () => {
  const dictCache = ref<Map<string, DictState>>(new Map())

  // In-flight promises to avoid duplicate requests
  const inflightPromises = new Map<string, Promise<DictItem[]>>()

  async function loadDict(typeCode: string): Promise<DictItem[]> {
    const existing = dictCache.value.get(typeCode)

    // Return cached data if available
    if (existing?.items.length) {
      return existing.items
    }

    // Return in-flight promise if exists
    if (inflightPromises.has(typeCode)) {
      return inflightPromises.get(typeCode)!
    }

    // Set loading state
    dictCache.value.set(typeCode, {
      items: [],
      loading: true,
      error: null,
    })

    // Create and cache the promise
    const promise = getDictDataList(typeCode)
      .then((data) => {
        const items = data.map((d) => ({ label: d.label, value: d.value }))
        dictCache.value.set(typeCode, {
          items,
          loading: false,
          error: null,
        })
        return items
      })
      .catch((error) => {
        const message = error instanceof Error ? error.message : '加载字典失败'
        dictCache.value.set(typeCode, {
          items: [],
          loading: false,
          error: message,
        })
        throw error
      })
      .finally(() => {
        inflightPromises.delete(typeCode)
      })

    inflightPromises.set(typeCode, promise)
    return promise
  }

  function getDict(typeCode: string): DictItem[] {
    return dictCache.value.get(typeCode)?.items || []
  }

  function getDictState(typeCode: string): DictState {
    return dictCache.value.get(typeCode) || { items: [], loading: false, error: null }
  }

  function isDictLoading(typeCode: string): boolean {
    return dictCache.value.get(typeCode)?.loading || false
  }

  function getDictError(typeCode: string): string | null {
    return dictCache.value.get(typeCode)?.error || null
  }

  function clearCache() {
    dictCache.value.clear()
    inflightPromises.clear()
  }

  function clearDict(typeCode: string) {
    dictCache.value.delete(typeCode)
    inflightPromises.delete(typeCode)
  }

  return {
    loadDict,
    getDict,
    getDictState,
    isDictLoading,
    getDictError,
    clearCache,
    clearDict,
  }
})
