<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { NTag } from 'naive-ui'
import { useDictStore } from '@/features/system/store/useDictStore'

const props = defineProps<{
  dict: string
  value: string | number
  type?: 'tag' | 'text'
}>()

const dictStore = useDictStore()

onMounted(() => {
  dictStore.loadDict(props.dict)
})

const dictItem = computed(() => {
  const list = dictStore.getDict(props.dict)
  return list.find((item) => item.value === String(props.value))
})

const tagType = computed(() => {
  const val = String(props.value)
  if (val === '0') return 'success'
  if (val === '1') return 'error'
  return 'default'
})
</script>

<template>
  <n-tag v-if="dictItem && type !== 'text'" :type="tagType" size="small">
    {{ dictItem.label }}
  </n-tag>
  <span v-else-if="dictItem && type === 'text'">{{ dictItem.label }}</span>
  <span v-else>{{ value }}</span>
</template>
