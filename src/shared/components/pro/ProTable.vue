<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useI18n } from 'vue-i18n'
import {
  NDataTable,
  NCard,
  NSpace,
  NButton,
  NIcon,
  NTooltip,
  NInput,
  NSelect,
  NResult,
} from 'naive-ui'
import { RefreshOutline, ExpandOutline, ContractOutline } from '@vicons/ionicons5'
import type { DataTableColumns, PaginationProps, SelectOption } from 'naive-ui'

interface SearchField {
  key: string
  label: string
  type?: 'input' | 'select'
  options?: SelectOption[]
}

interface RequestParams {
  page: number
  pageSize: number
  [key: string]: string | number
}

interface RequestResult<TRow> {
  items: TRow[]
  total: number
}

interface Props<TRow = Record<string, unknown>> {
  columns: DataTableColumns<TRow>
  request: (params: RequestParams) => Promise<RequestResult<TRow>>
  searchFields?: SearchField[]
  pagination?: boolean
  pageSize?: number
  rowKey?: string
  toolbar?: boolean
  title?: string
}

const props = withDefaults(defineProps<Props>(), {
  searchFields: () => [],
  pagination: true,
  pageSize: 10,
  rowKey: 'id',
  toolbar: true,
  title: '',
})

const { t } = useI18n()

const emit = defineEmits<{
  search: [values: Record<string, string | number>]
  reset: []
  add: []
}>()

const loading = ref(false)
const tableData = ref<Record<string, unknown>[]>([])
const total = ref(0)
const searchValues = ref<Record<string, string | number | undefined>>({})
const currentPage = ref(1)
const currentPageSize = ref(props.pageSize)
const isFullscreen = ref(false)
const error = ref<Error | null>(null)
const requestId = ref(0)

function getSearchValue(key: string): string | number | undefined {
  return searchValues.value[key] as string | number | undefined
}

function getInputValue(key: string): string {
  const val = searchValues.value[key]
  return val != null ? String(val) : ''
}

function getRowKeyValue(row: Record<string, unknown>): string | number {
  return row[props.rowKey] as string | number
}

const tablePagination = computed<PaginationProps>(() => ({
  page: currentPage.value,
  pageSize: currentPageSize.value,
  itemCount: total.value,
  showSizePicker: true,
  pageSizes: [10, 20, 50, 100],
  prefix: ({ itemCount }: { itemCount: number | undefined }) =>
    t('common.total', { total: itemCount ?? 0 }),
  onChange: (page: number) => {
    currentPage.value = page
    fetchData()
  },
  onUpdatePageSize: (pageSize: number) => {
    currentPageSize.value = pageSize
    currentPage.value = 1
    fetchData()
  },
}))

async function fetchData() {
  const currentRequestId = ++requestId.value
  loading.value = true
  error.value = null
  try {
    const result = await props.request({
      page: currentPage.value,
      pageSize: currentPageSize.value,
      ...searchValues.value,
    })
    if (currentRequestId !== requestId.value) {
      return
    }
    tableData.value = result.items as Record<string, unknown>[]
    total.value = result.total
  } catch (e) {
    if (currentRequestId !== requestId.value) {
      return
    }
    error.value = e instanceof Error ? e : new Error(String(e))
  } finally {
    if (currentRequestId === requestId.value) {
      loading.value = false
    }
  }
}

function handleSearch() {
  currentPage.value = 1
  fetchData()
  const cleanValues: Record<string, string | number> = {}
  for (const [key, val] of Object.entries(searchValues.value)) {
    if (val !== undefined) {
      cleanValues[key] = val
    }
  }
  emit('search', cleanValues)
}

function handleReset() {
  searchValues.value = {}
  currentPage.value = 1
  fetchData()
  emit('reset')
}

function toggleFullscreen() {
  isFullscreen.value = !isFullscreen.value
}

function handleRefresh() {
  fetchData()
}

function handleRetry() {
  fetchData()
}

function handleKeydown(e: KeyboardEvent) {
  if (e.key === 'Escape' && isFullscreen.value) {
    isFullscreen.value = false
  }
}

onMounted(() => {
  fetchData()
  document.addEventListener('keydown', handleKeydown)
})

onUnmounted(() => {
  document.removeEventListener('keydown', handleKeydown)
})

defineExpose({
  refresh: fetchData,
  reset: handleReset,
})
</script>

<template>
  <n-card :title="title" :bordered="false" :class="{ 'pro-table-fullscreen': isFullscreen }">
    <div v-if="searchFields.length" class="search-bar">
      <n-space align="center">
        <template v-for="field in searchFields" :key="field.key">
          <n-input
            v-if="!field.type || field.type === 'input'"
            :value="getInputValue(field.key)"
            :placeholder="field.label"
            clearable
            class="search-input"
            @update:value="(val: string) => (searchValues[field.key] = val)"
            @keyup.enter="handleSearch"
          />
          <n-select
            v-else-if="field.type === 'select'"
            :value="getSearchValue(field.key)"
            :placeholder="field.label"
            :options="field.options || []"
            clearable
            class="search-input"
            @update:value="(val: string | number) => (searchValues[field.key] = val)"
          />
        </template>
        <n-button type="primary" @click="handleSearch">{{ t('common.search') }}</n-button>
        <n-button @click="handleReset">{{ t('common.reset') }}</n-button>
      </n-space>
    </div>

    <div v-if="toolbar" class="toolbar">
      <n-space>
        <slot name="toolbar" />
      </n-space>
      <n-space>
        <n-tooltip trigger="hover">
          <template #trigger>
            <n-button quaternary circle :aria-label="t('common.refresh')" @click="handleRefresh">
              <template #icon>
                <n-icon><RefreshOutline /></n-icon>
              </template>
            </n-button>
          </template>
          {{ t('common.refresh') }}
        </n-tooltip>
        <n-tooltip trigger="hover">
          <template #trigger>
            <n-button
              quaternary
              circle
              :aria-pressed="isFullscreen"
              :aria-label="isFullscreen ? t('common.exitFullscreen') : t('common.fullscreen')"
              @click="toggleFullscreen"
            >
              <template #icon>
                <n-icon>
                  <ContractOutline v-if="isFullscreen" />
                  <ExpandOutline v-else />
                </n-icon>
              </template>
            </n-button>
          </template>
          {{ isFullscreen ? t('common.exitFullscreen') : t('common.fullscreen') }}
        </n-tooltip>
      </n-space>
    </div>

    <n-result
      v-if="error && !tableData.length"
      status="error"
      :title="t('common.error')"
      :description="error.message"
    >
      <template #footer>
        <n-button data-testid="retry-button" @click="handleRetry">
          {{ t('common.retry') }}
        </n-button>
      </template>
    </n-result>

    <n-data-table
      v-else
      :columns="columns"
      :data="tableData"
      :loading="loading"
      :pagination="props.pagination ? tablePagination : false"
      :row-key="getRowKeyValue"
      :bordered="false"
      striped
    />

    <slot name="extra" />
  </n-card>
</template>

<style scoped>
.pro-table-fullscreen {
  position: fixed;
  inset: 0;
  z-index: var(--z-modal);
  overflow: auto;
}

.search-bar {
  margin-bottom: var(--space-4);
}

.search-input {
  width: 200px;
}

.toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--space-3);
}

@media (max-width: 767px) {
  .search-bar :deep(.n-grid) {
    grid-template-columns: 1fr !important;
  }

  .search-input {
    width: 100%;
  }

  .toolbar {
    flex-direction: column;
    gap: var(--space-2);
    align-items: flex-start;
  }
}
</style>
