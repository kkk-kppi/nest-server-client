<script setup lang="ts">
import { ref } from 'vue'
import { NSpace, NButton, NIcon, NInput, NSelect } from 'naive-ui'
import { SearchOutline, RefreshOutline } from '@vicons/ionicons5'
import type { SelectOption } from 'naive-ui'

interface SearchField {
  key: string
  label: string
  type?: string
  options?: SelectOption[]
}

defineProps<{
  fields: SearchField[]
}>()

const emit = defineEmits<{
  search: [values: Record<string, unknown>]
  reset: []
}>()

const searchValues = ref<Record<string, string | undefined>>({})
const expanded = ref(false)

function handleSearch() {
  emit('search', searchValues.value as Record<string, unknown>)
}

function handleReset() {
  searchValues.value = {}
  emit('reset')
}
</script>

<template>
  <div class="search-bar">
    <n-space align="center">
      <template v-for="field in fields.slice(0, expanded ? fields.length : 3)" :key="field.key">
        <n-input
          v-if="!field.type || field.type === 'input'"
          v-model:value="searchValues[field.key]"
          :placeholder="field.label"
          clearable
          class="search-input"
          @keyup.enter="handleSearch"
        />
        <n-select
          v-else-if="field.type === 'select'"
          v-model:value="searchValues[field.key]"
          :placeholder="field.label"
          :options="field.options || []"
          clearable
          class="search-input"
        />
      </template>
      <n-button type="primary" @click="handleSearch">
        <template #icon>
          <n-icon><SearchOutline /></n-icon>
        </template>
        搜索
      </n-button>
      <n-button @click="handleReset">
        <template #icon>
          <n-icon><RefreshOutline /></n-icon>
        </template>
        重置
      </n-button>
      <n-button v-if="fields.length > 3" text @click="expanded = !expanded">
        {{ expanded ? '收起' : '展开' }}
      </n-button>
    </n-space>
  </div>
</template>

<style scoped>
.search-bar {
  margin-bottom: var(--space-4);
}

.search-input {
  width: 200px;
}
</style>
