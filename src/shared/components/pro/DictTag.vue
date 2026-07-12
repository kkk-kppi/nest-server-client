<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { NTag, NSpin, NTooltip } from 'naive-ui'
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

const isLoading = computed(() => dictStore.isDictLoading(props.dict))
const error = computed(() => dictStore.getDictError(props.dict))

const tagType = computed(() => {
  const val = String(props.value)
  if (val === '0') return 'success'
  if (val === '1') return 'error'
  return 'default'
})

function handleRetry() {
  dictStore.clearDict(props.dict)
  dictStore.loadDict(props.dict)
}
</script>

<template>
  <n-spin v-if="isLoading" :size="16" />
  <n-tooltip v-else-if="error" trigger="hover">
    <template #trigger>
      <n-tag type="error" size="small" style="cursor: pointer" @click="handleRetry">
        加载失败
      </n-tag>
    </template>
    {{ error }}
  </n-tooltip>
  <n-tag v-else-if="dictItem && type !== 'text'" :type="tagType" size="small">
    {{ dictItem.label }}
  </n-tag>
  <span v-else-if="dictItem && type === 'text'">{{ dictItem.label }}</span>
  <span v-else>{{ value }}</span>
</template>
