<script setup lang="ts">
import { ref, computed, h, onMounted } from 'vue'
import { NTag, NCard, NDataTable, NButton, NSpace, NPopconfirm } from 'naive-ui'
import ProModalForm from '@/shared/components/pro/ProModalForm.vue'
import {
  getDictTypeList,
  createDictType,
  updateDictType,
  deleteDictType,
  getDictDataList,
  createDictData,
  updateDictData,
  deleteDictData,
  type DictTypeData,
  type DictDataItem,
} from '@/features/system/api'
import type { DataTableColumns } from 'naive-ui'

const dictTypes = ref<DictTypeData>([])
const dictData = ref<DictDataItem[]>([])
const selectedType = ref<string>('')
const loadingTypes = ref(false)
const loadingData = ref(false)

// 字典类型表单
const showTypeModal = ref(false)
const editingType = ref<DictTypeData[number] | null>(null)
const typeFormValue = ref({
  name: '',
  code: '',
  status: '0' as '0' | '1',
})

// 字典数据表单
const showDataModal = ref(false)
const editingData = ref<DictDataItem | null>(null)
const dataFormValue = ref({
  label: '',
  value: '',
  sort: 0,
  status: '0' as '0' | '1',
})

const typeFormFields = computed(() => [
  { key: 'name', label: '字典名称', required: true },
  {
    key: 'code',
    label: '字典编码',
    required: true,
    disabled: !!editingType.value,
  },
  {
    key: 'status',
    label: '状态',
    type: 'select' as const,
    options: [
      { label: '正常', value: '0' },
      { label: '停用', value: '1' },
    ],
  },
])

const dataFormFields = [
  { key: 'label', label: '标签', required: true, group: 'basic' },
  { key: 'value', label: '值', required: true, group: 'basic' },
  { key: 'sort', label: '排序', type: 'number' as const, group: 'config', props: { min: 0 } },
  {
    key: 'status',
    label: '状态',
    type: 'select' as const,
    options: [
      { label: '正常', value: '0' },
      { label: '停用', value: '1' },
    ],
    group: 'config',
  },
]

const dataFormSections = [
  { key: 'basic', title: '基本信息' },
  { key: 'config', title: '配置' },
]

const typeColumns: DataTableColumns<DictTypeData[number]> = [
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
  {
    title: '操作',
    key: 'action',
    width: 150,
    render: (row) =>
      h(
        NSpace,
        { size: 'small' },
        {
          default: () => [
            h(
              NButton,
              { text: true, type: 'primary', onClick: () => handleEditType(row) },
              { default: () => '编辑' },
            ),
            h(
              NPopconfirm,
              { onPositiveClick: () => handleDeleteType(row.id) },
              {
                trigger: () => h(NButton, { text: true, type: 'error' }, { default: () => '删除' }),
                default: () => '确认删除？',
              },
            ),
          ],
        },
      ),
  },
]

const dataColumns: DataTableColumns<DictDataItem> = [
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
  {
    title: '操作',
    key: 'action',
    width: 150,
    render: (row) =>
      h(
        NSpace,
        { size: 'small' },
        {
          default: () => [
            h(
              NButton,
              { text: true, type: 'primary', onClick: () => handleEditData(row) },
              { default: () => '编辑' },
            ),
            h(
              NPopconfirm,
              { onPositiveClick: () => handleDeleteData(row.id) },
              {
                trigger: () => h(NButton, { text: true, type: 'error' }, { default: () => '删除' }),
                default: () => '确认删除？',
              },
            ),
          ],
        },
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

// 字典类型 CRUD
function handleAddType() {
  editingType.value = null
  typeFormValue.value = { name: '', code: '', status: '0' }
  showTypeModal.value = true
}

function handleEditType(row: DictTypeData[number]) {
  editingType.value = row
  typeFormValue.value = {
    name: row.name,
    code: row.code,
    status: row.status,
  }
  showTypeModal.value = true
}

async function handleDeleteType(id: string) {
  await deleteDictType(id)
  await loadDictTypes()
}

async function handleTypeSubmit() {
  if (editingType.value) {
    await updateDictType(editingType.value.id, { ...typeFormValue.value })
  } else {
    await createDictType({ ...typeFormValue.value })
  }
  showTypeModal.value = false
  await loadDictTypes()
}

// 字典数据 CRUD
function handleAddData() {
  if (!selectedType.value) return
  editingData.value = null
  dataFormValue.value = { label: '', value: '', sort: 0, status: '0' }
  showDataModal.value = true
}

function handleEditData(row: DictDataItem) {
  editingData.value = row
  dataFormValue.value = {
    label: row.label,
    value: row.value,
    sort: row.sort,
    status: row.status,
  }
  showDataModal.value = true
}

async function handleDeleteData(id: string) {
  await deleteDictData(id)
  await loadDictData()
}

async function handleDataSubmit() {
  if (editingData.value) {
    await updateDictData(editingData.value.id, { ...dataFormValue.value })
  } else {
    await createDictData(selectedType.value, { ...dataFormValue.value })
  }
  showDataModal.value = false
  await loadDictData()
}

onMounted(() => {
  loadDictTypes()
})
</script>

<template>
  <div class="dict-layout">
    <n-card title="字典类型" :bordered="false" class="dict-data-card">
      <template #header-extra>
        <n-button type="primary" size="small" @click="handleAddType">新增</n-button>
      </template>
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
    <n-card title="字典数据" :bordered="false" class="dict-data-card">
      <template #header-extra>
        <n-button type="primary" size="small" :disabled="!selectedType" @click="handleAddData">
          新增
        </n-button>
      </template>
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

  <ProModalForm
    v-model:show="showTypeModal"
    :title="editingType ? '编辑字典类型' : '新增字典类型'"
    :fields="typeFormFields"
    :model="typeFormValue"
    @update:model="(val) => (typeFormValue = val as typeof typeFormValue)"
    @submit="handleTypeSubmit"
  />

  <ProModalForm
    v-model:show="showDataModal"
    :title="editingData ? '编辑字典数据' : '新增字典数据'"
    :fields="dataFormFields"
    :sections="dataFormSections"
    :model="dataFormValue"
    @update:model="(val) => (dataFormValue = val as typeof dataFormValue)"
    @submit="handleDataSubmit"
  />
</template>

<style scoped>
.selected-row {
  background-color: var(--n-merged-row-color-hover) !important;
}

.dict-data-card {
  flex: 1;
}

.dict-layout {
  display: flex;
  gap: var(--space-4);
}

@media (max-width: 767px) {
  .dict-layout {
    flex-direction: column;
  }
}
</style>
