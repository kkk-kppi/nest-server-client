<script setup lang="ts">
import { ref, h, onMounted } from 'vue'
import {
  NTag,
  NCard,
  NDataTable,
  NButton,
  NSpace,
  NPopconfirm,
  NModal,
  NForm,
  NFormItem,
  NInput,
  NInputNumber,
  NSelect,
} from 'naive-ui'
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
  <div style="display: flex; gap: 16px">
    <n-card title="字典类型" :bordered="false" style="flex: 1">
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
    <n-card title="字典数据" :bordered="false" style="flex: 1">
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

  <!-- 字典类型弹窗 -->
  <n-modal
    v-model:show="showTypeModal"
    preset="dialog"
    :title="editingType ? '编辑字典类型' : '新增字典类型'"
    style="width: 500px"
  >
    <n-form :model="typeFormValue" label-width="80">
      <n-form-item label="字典名称"><n-input v-model:value="typeFormValue.name" /></n-form-item>
      <n-form-item label="字典编码">
        <n-input v-model:value="typeFormValue.code" :disabled="!!editingType" />
      </n-form-item>
      <n-form-item label="状态">
        <n-select
          v-model:value="typeFormValue.status"
          :options="[
            { label: '正常', value: '0' },
            { label: '停用', value: '1' },
          ]"
        />
      </n-form-item>
    </n-form>
    <template #action>
      <n-button @click="showTypeModal = false">取消</n-button>
      <n-button type="primary" @click="handleTypeSubmit">确定</n-button>
    </template>
  </n-modal>

  <!-- 字典数据弹窗 -->
  <n-modal
    v-model:show="showDataModal"
    preset="dialog"
    :title="editingData ? '编辑字典数据' : '新增字典数据'"
    style="width: 500px"
  >
    <n-form :model="dataFormValue" label-width="80">
      <n-form-item label="标签"><n-input v-model:value="dataFormValue.label" /></n-form-item>
      <n-form-item label="值"><n-input v-model:value="dataFormValue.value" /></n-form-item>
      <n-form-item label="排序">
        <n-input-number v-model:value="dataFormValue.sort" :min="0" />
      </n-form-item>
      <n-form-item label="状态">
        <n-select
          v-model:value="dataFormValue.status"
          :options="[
            { label: '正常', value: '0' },
            { label: '停用', value: '1' },
          ]"
        />
      </n-form-item>
    </n-form>
    <template #action>
      <n-button @click="showDataModal = false">取消</n-button>
      <n-button type="primary" @click="handleDataSubmit">确定</n-button>
    </template>
  </n-modal>
</template>

<style scoped>
.selected-row {
  background-color: var(--n-merged-row-color-hover) !important;
}
</style>
