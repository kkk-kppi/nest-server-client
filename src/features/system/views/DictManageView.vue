<script setup lang="ts">
import { ref, h, onMounted } from 'vue'
import { NTag, NCard, NDataTable } from 'naive-ui'
import {
  getDictTypeList,
  getDictDataList,
  type DictTypeData,
  type DictDataItem,
} from '@/features/system/api'
import type { DataTableColumns } from 'naive-ui'

const dictTypes = ref<DictTypeData>([])
const dictData = ref<DictDataItem[]>([])
const selectedType = ref<string>('')
const loadingTypes = ref(false)
const loadingData = ref(false)

const typeColumns: DataTableColumns = [
  { title: '字典名称', key: 'name', width: 120 },
  { title: '字典编码', key: 'code', width: 150 },
  {
    title: '状态',
    key: 'status',
    width: 80,
    render: (row) =>
      h(
        NTag,
        { type: row.status === '0' ? 'success' : 'error', size: 'small' },
        { default: () => (row.status === '0' ? '正常' : '停用') },
      ),
  },
]

const dataColumns: DataTableColumns = [
  { title: '标签', key: 'label', width: 120 },
  { title: '值', key: 'value', width: 80 },
  { title: '排序', key: 'sort', width: 80 },
  {
    title: '状态',
    key: 'status',
    width: 80,
    render: (row) =>
      h(
        NTag,
        { type: row.status === '0' ? 'success' : 'error', size: 'small' },
        { default: () => (row.status === '0' ? '正常' : '停用') },
      ),
  },
]

async function loadDictTypes() {
  loadingTypes.value = true
  try {
    dictTypes.value = await getDictTypeList()
    if (dictTypes.value.length > 0 && !selectedType.value) {
      selectedType.value = dictTypes.value[0].code
      await loadDictData()
    }
  } finally {
    loadingTypes.value = false
  }
}

async function loadDictData() {
  if (!selectedType.value) return
  loadingData.value = true
  try {
    dictData.value = await getDictDataList(selectedType.value)
  } finally {
    loadingData.value = false
  }
}

function handleTypeSelect(row: DictTypeData[number]) {
  selectedType.value = row.code
  loadDictData()
}

onMounted(() => {
  loadDictTypes()
})
</script>

<template>
  <div style="display: flex; gap: 16px">
    <n-card title="字典类型" :bordered="false" style="flex: 1">
      <n-data-table
        :columns="typeColumns"
        :data="dictTypes"
        :loading="loadingTypes"
        :row-key="(row: Record<string, unknown>) => row.code as string"
        :bordered="false"
        striped
        :pagination="false"
        :max-height="400"
        :row-class-name="
          (row: Record<string, unknown>) => (row.code === selectedType ? 'selected-row' : '')
        "
        @row-click="handleTypeSelect"
      />
    </n-card>
    <n-card title="字典数据" :bordered="false" style="flex: 1">
      <n-data-table
        :columns="dataColumns"
        :data="dictData"
        :loading="loadingData"
        :row-key="(row: Record<string, unknown>) => row.id as string"
        :bordered="false"
        striped
        :pagination="false"
        :max-height="400"
      />
    </n-card>
  </div>
</template>

<style scoped>
.selected-row {
  background-color: var(--n-merged-row-color-hover) !important;
}
</style>
