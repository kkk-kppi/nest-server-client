import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useMutation } from './useMutation'
import { usePermission } from '@/features/auth'
import type { DataTableColumns } from 'naive-ui'
import type { FormField, FormSection } from '@/shared/components/pro/ProForm.vue'

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

interface UseCrudOptions {
  columns: DataTableColumns
  request: (params: RequestParams) => Promise<RequestResult>
  searchFields?: Array<{
    key: string
    label: string
    type?: string
    options?: Array<{ label: string; value: string | number }>
  }>
  formFields: FormField[]
  formSections?: FormSection[]
  permission?: ProCrudPermission
  deleteConfirmType?: 'modal' | 'popconfirm'
  batchDelete?: boolean
  createFn?: (data: Record<string, unknown>) => Promise<void>
  updateFn?: (id: string, data: Record<string, unknown>) => Promise<void>
  deleteFn?: (id: string) => Promise<void>
  batchDeleteFn?: (ids: string[]) => Promise<void>
  onSuccess?: () => void
  rowKey?: string
}

export function useCrud(options: UseCrudOptions) {
  const { t } = useI18n()
  const {
    columns,
    request,
    searchFields = [],
    formFields,
    formSections = [],
    permission,
    createFn,
    updateFn,
    deleteFn,
    batchDeleteFn,
    onSuccess,
    rowKey = 'id',
  } = options

  const showModal = ref(false)
  const editingRow = ref<Record<string, unknown> | null>(null)
  const formValue = ref<Record<string, unknown>>({})
  const selectedRowKeys = ref<string[]>([])
  const proTableRef = ref<{ refresh: () => void; reset: () => void } | null>(null)

  const { hasPermission } = usePermission()

  function checkPermission(code?: string | string[]): boolean {
    if (!code) return true
    const codes = Array.isArray(code) ? code : [code]
    return hasPermission(codes)
  }

  const canCreate = computed(() => checkPermission(permission?.create))
  const canUpdate = computed(() => checkPermission(permission?.update))
  const canDelete = computed(() => checkPermission(permission?.delete))
  const canBatchDelete = computed(() => checkPermission(permission?.batchDelete))

  const createMutation = useMutation({
    mutationFn: (data: Record<string, unknown>) => createFn!(data),
    onSuccess: () => {
      showModal.value = false
      proTableRef.value?.refresh()
      onSuccess?.()
    },
  })

  const updateMutation = useMutation({
    mutationFn: (data: Record<string, unknown>) =>
      updateFn!(editingRow.value![rowKey] as string, data),
    onSuccess: () => {
      showModal.value = false
      proTableRef.value?.refresh()
      onSuccess?.()
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteFn!(id),
    onSuccess: () => {
      proTableRef.value?.refresh()
      onSuccess?.()
    },
  })

  const batchDeleteMutation = useMutation({
    mutationFn: (ids: string[]) => batchDeleteFn!(ids),
    onSuccess: () => {
      selectedRowKeys.value = []
      proTableRef.value?.refresh()
      onSuccess?.()
    },
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

  async function handleSubmit() {
    if (editingRow.value) {
      await updateMutation.mutate(formValue.value)
    } else {
      await createMutation.mutate(formValue.value)
    }
  }

  async function handleDelete(row: Record<string, unknown>) {
    const id = row[rowKey] as string
    await deleteMutation.mutate(id)
  }

  async function handleBatchDelete() {
    if (!selectedRowKeys.value.length) return
    await batchDeleteMutation.mutate(selectedRowKeys.value)
  }

  function refresh() {
    proTableRef.value?.refresh()
  }

  function reset() {
    proTableRef.value?.reset()
  }

  const tableProps = computed(() => ({
    columns,
    request,
    searchFields,
    rowKey,
    title: '',
    pagination: true,
    pageSize: 10,
    toolbar: true,
  }))

  const modalProps = computed(() => ({
    title: editingRow.value ? t('common.edit') : t('common.add'),
    fields: formFields,
    sections: formSections,
    model: formValue.value,
    loading: createMutation.isLoading.value || updateMutation.isLoading.value,
    disabled: createMutation.isLoading.value || updateMutation.isLoading.value,
  }))

  return {
    tableProps,
    modalProps,
    showModal,
    editingRow,
    formValue,
    selectedRowKeys,
    proTableRef,
    canCreate,
    canUpdate,
    canDelete,
    canBatchDelete,
    openAdd,
    openEdit,
    handleSubmit,
    handleDelete,
    handleBatchDelete,
    refresh,
    reset,
  }
}
