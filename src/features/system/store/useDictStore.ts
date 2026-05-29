import { defineStore } from 'pinia'
import { ref } from 'vue'
import { getDictDataList } from '@/features/system/api'

interface DictItem {
  label: string
  value: string
}

export const useDictStore = defineStore('dict', () => {
  const dictCache = ref<Map<string, DictItem[]>>(new Map())

  async function loadDict(typeCode: string): Promise<DictItem[]> {
    if (dictCache.value.has(typeCode)) {
      return dictCache.value.get(typeCode)!
    }

    const data = await getDictDataList(typeCode)
    const items = data.map((d) => ({ label: d.label, value: d.value }))
    dictCache.value.set(typeCode, items)
    return items
  }

  function getDict(typeCode: string): DictItem[] {
    return dictCache.value.get(typeCode) || []
  }

  function clearCache() {
    dictCache.value.clear()
  }

  return { loadDict, getDict, clearCache }
})
