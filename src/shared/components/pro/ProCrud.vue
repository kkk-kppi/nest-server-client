<script setup lang="ts">
import { ref, computed, h } from 'vue'
import { useI18n } from 'vue-i18n'
import { NButton, NSpace, NPopconfirm, NModal } from 'naive-ui'
import ProTable from './ProTable.vue'
import ProModalForm from './ProModalForm.vue'
import type { DataTableColumns, DataTableColumn } from 'naive-ui'
import type { FormField, FormSection } from './ProForm.vue'
import { usePermission } from '@/features/auth'
import { useMutation } from '@/shared/composables/useMutation'

interface SearchField {
  key: string
  label: string
  type?: 'input' | 'select'
  options?: Array<{ label: string; value: string | number }>
}

interface RequestParams {
  page: number
  pageSize: number
  [key: string]: string | number
}

interface RequestResult {
  items: Record<string, unknown>[]
  total: number
}

interface ProCrudPermission {
  create?: string | string[]
  update?: string | string[]
  delete?: string | string[]
  batchDelete?: string | string[]
}

interface CrudFunctions {
  createFn: (data: Record<string, unknown>) => Promise<void>
  updateFn: (id: string, data: Record<string, unknown>) => Promise<void>
  deleteFn: (id: string) => Promise<void>
  batchDeleteFn?: (ids: string[]) => Promise<void>
}

interface CrudTexts {
  add?: string
  edit?: string
  delete?: string
  batchDelete?: string
  deleteConfirm?: string
  createSuccess?: string
  updateSuccess?: string
  deleteSuccess?: string
  batchDeleteSuccess?: string
}

interface Props {
  columns: DataTableColumns<Record<string, unknown>>
  request: (params: RequestParams) => Promise<RequestResult>
  searchFields?: SearchField[]
  pagination?: boolean
  pageSize?: number
  rowKey?: string
  title?: string
  formFields: FormField[]
  formSections?: FormSection[]
  formWidth?: number | string
  labelWidth?: number
  labelPlacement?: 'left' | 'top'
  formCols?: number
  permission?: ProCrudPermission
  deleteConfirmType?: 'modal' | 'popconfirm'
  crudFunctions: CrudFunctions
  texts?: CrudTexts
}

const props = withDefaults(defineProps<Props>(), {
  searchFields: () => [],
  pagination: true,
  pageSize: 10,
  rowKey: 'id',
  title: '',
  formSections: () => [],
  formWidth: 520,
  labelWidth: 100,
  labelPlacement: 'left',
  formCols: 1,
  permission: () => ({}),
  deleteConfirmType: 'popconfirm',
  texts: () => ({}),
})

const { t } = useI18n()
const { hasPermission } = usePermission()

const emit = defineEmits<{
  search: [values: Record<string, string | number>]
  reset: []
  'create-success': []
  'update-success': []
  'delete-success': []
  'batch-delete-success': []
}>()

const proTableRef = ref<InstanceType<typeof ProTable> | null>(null)
const showModal = ref(false)
const editingRow = ref<Record<string, unknown> | null>(null)
const formValue = ref<Record<string, unknown>>({})
const selectedRowKeys = ref<string[]>([])
const showDeleteModal = ref(false)
const deletingRow = ref<Record<string, unknown> | null>(null)

function checkPermission(code?: string | string[]): boolean {
  if (!code) return true
  const codes = Array.isArray(code) ? code : [code]
  return hasPermission(codes)
}

const canCreate = computed(() => checkPermission(props.permission?.create))
const canUpdate = computed(() => checkPermission(props.permission?.update))
const canDelete = computed(() => checkPermission(props.permission?.delete))
const canBatchDelete = computed(() => checkPermission(props.permission?.batchDelete))

const defaultTexts = computed(() => ({
  add: t('common.add'),
  edit: t('common.edit'),
  delete: t('common.delete'),
  batchDelete: t('common.batchDelete'),
  deleteConfirm: t('common.deleteConfirm'),
  createSuccess: t('common.createSuccess'),
  updateSuccess: t('common.updateSuccess'),
  deleteSuccess: t('common.deleteSuccess'),
  batchDeleteSuccess: t('common.batchDeleteSuccess'),
}))

const mergedTexts = computed(() => ({
  ...defaultTexts.value,
  ...props.texts,
}))

const createMutation = useMutation({
  mutationFn: (data: Record<string, unknown>) => props.crudFunctions.createFn(data),
  onSuccess: () => {
    showModal.value = false
    proTableRef.value?.refresh()
    emit('create-success')
  },
})

const updateMutation = useMutation({
  mutationFn: (data: Record<string, unknown>) =>
    props.crudFunctions.updateFn(editingRow.value![props.rowKey] as string, data),
  onSuccess: () => {
    showModal.value = false
    proTableRef.value?.refresh()
    emit('update-success')
  },
})

const deleteMutation = useMutation({
  mutationFn: (id: string) => props.crudFunctions.deleteFn(id),
  onSuccess: () => {
    proTableRef.value?.refresh()
    emit('delete-success')
  },
})

const batchDeleteMutation = useMutation({
  mutationFn: (ids: string[]) => {
    if (!props.crudFunctions.batchDeleteFn) {
      throw new Error('batchDeleteFn is not provided')
    }
    return props.crudFunctions.batchDeleteFn(ids)
  },
  onSuccess: () => {
    selectedRowKeys.value = []
    proTableRef.value?.refresh()
    emit('batch-delete-success')
  },
})

const formLoading = computed(() => createMutation.isLoading.value || updateMutation.isLoading.value)

const modalTitle = computed(() =>
  editingRow.value ? mergedTexts.value.edit : mergedTexts.value.add,
)

const mergedColumns = computed<DataTableColumns<Record<string, unknown>>>(() => {
  const hasActions = canUpdate.value || canDelete.value
  if (!hasActions) return props.columns

  const actionColumn: DataTableColumn<Record<string, unknown>> = {
    title: t('common.actions'),
    key: 'actions',
    width: 160,
    fixed: 'right',
    render(row) {
      const buttons: ReturnType<typeof h>[] = []

      if (canUpdate.value) {
        buttons.push(
          h(
            NButton,
            { size: 'small', quaternary: true, type: 'primary', onClick: () => openEdit(row) },
            () => mergedTexts.value.edit,
          ),
        )
      }

      if (canDelete.value) {
        if (props.deleteConfirmType === 'popconfirm') {
          buttons.push(
            h(
              NPopconfirm,
              {
                onPositiveClick: () => handlePopconfirmDelete(row),
              },
              {
                trigger: () =>
                  h(
                    NButton,
                    { size: 'small', quaternary: true, type: 'error' },
                    () => mergedTexts.value.delete,
                  ),
                default: () => mergedTexts.value.deleteConfirm,
              },
            ),
          )
        } else {
          buttons.push(
            h(
              NButton,
              { size: 'small', quaternary: true, type: 'error', onClick: () => handleDelete(row) },
              () => mergedTexts.value.delete,
            ),
          )
        }
      }

      return h(NSpace, { size: 'small' }, () => buttons)
    },
  }

  return [...props.columns, actionColumn]
})

function openAdd() {
  editingRow.value = null
  formValue.value = {}
  showModal.value = true
}

function openEdit(row: Record<string, unknown>) {
  editingRow.value = row
  formValue.value = { ...row }
  showModal.value = true
}

function handleFormSubmit(model: Record<string, unknown>) {
  if (editingRow.value) {
    updateMutation.mutate(model)
  } else {
    createMutation.mutate(model)
  }
}

function handleFormCancel() {
  showModal.value = false
}

function handleUpdateModel(value: Record<string, unknown>) {
  formValue.value = value
}

function handleDelete(row: Record<string, unknown>) {
  if (props.deleteConfirmType === 'modal') {
    deletingRow.value = row
    showDeleteModal.value = true
  } else {
    const id = row[props.rowKey] as string
    deleteMutation.mutate(id)
  }
}

function handleConfirmDelete() {
  if (props.deleteConfirmType === 'modal' && deletingRow.value) {
    const id = deletingRow.value[props.rowKey] as string
    deleteMutation.mutate(id)
    showDeleteModal.value = false
    deletingRow.value = null
  }
}

function handleCancelDelete() {
  showDeleteModal.value = false
  deletingRow.value = null
}

function handlePopconfirmDelete(row: Record<string, unknown>) {
  const id = row[props.rowKey] as string
  deleteMutation.mutate(id)
}

function handleBatchDelete() {
  if (!selectedRowKeys.value.length) return
  batchDeleteMutation.mutate(selectedRowKeys.value)
}

function handleSearch(values: Record<string, string | number>) {
  emit('search', values)
}

function handleReset() {
  emit('reset')
}

function refresh() {
  proTableRef.value?.refresh()
}

function reset() {
  proTableRef.value?.reset()
}

defineExpose({
  refresh,
  reset,
  openAdd,
  openEdit,
})
</script>

<template>
  <div class="pro-crud">
    <ProTable
      ref="proTableRef"
      :columns="mergedColumns"
      :request="props.request"
      :search-fields="props.searchFields"
      :pagination="props.pagination"
      :page-size="props.pageSize"
      :row-key="props.rowKey"
      :title="props.title"
      @search="handleSearch"
      @reset="handleReset"
    >
      <template #toolbar>
        <n-button v-if="canCreate" type="primary" @click="openAdd">
          {{ mergedTexts.add }}
        </n-button>
        <n-button
          v-if="canBatchDelete && props.crudFunctions.batchDeleteFn"
          :disabled="!selectedRowKeys.length"
          @click="handleBatchDelete"
        >
          {{ mergedTexts.batchDelete }}
        </n-button>
      </template>
    </ProTable>

    <ProModalForm
      :show="showModal"
      :title="modalTitle"
      :fields="props.formFields"
      :sections="props.formSections"
      :model="formValue"
      :loading="formLoading"
      :width="props.formWidth"
      :label-width="props.labelWidth"
      :label-placement="props.labelPlacement"
      :cols="props.formCols"
      @update:show="(val: boolean) => (showModal = val)"
      @update:model="handleUpdateModel"
      @submit="handleFormSubmit"
      @cancel="handleFormCancel"
    />

    <template v-if="props.deleteConfirmType === 'modal'">
      <n-modal
        :show="showDeleteModal"
        preset="dialog"
        :title="mergedTexts.delete"
        :content="mergedTexts.deleteConfirm"
        positive-text=""
        @update:show="(val: boolean) => (showDeleteModal = val)"
      >
        <template #action>
          <n-space justify="end">
            <n-button @click="handleCancelDelete">
              {{ t('common.cancel') }}
            </n-button>
            <n-button
              type="error"
              :loading="deleteMutation.isLoading.value"
              @click="handleConfirmDelete"
            >
              {{ t('common.confirm') }}
            </n-button>
          </n-space>
        </template>
      </n-modal>
    </template>
  </div>
</template>

<style scoped>
.pro-crud {
  width: 100%;
}
</style>
