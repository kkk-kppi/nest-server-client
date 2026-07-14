<script setup lang="ts">
import { ref, h } from 'vue'
import { NButton, NSpace, NTag, NPopconfirm } from 'naive-ui'
import ProTable from '@/shared/components/pro/ProTable.vue'
import ProModalForm from '@/shared/components/pro/ProModalForm.vue'
import {
  getSystemRoleList,
  createSystemRole,
  updateSystemRole,
  deleteSystemRole,
} from '@/features/system/api'
import type { DataTableColumns } from 'naive-ui'

const proTableRef = ref()
const showModal = ref(false)
const editingRole = ref<Record<string, unknown> | null>(null)
const formValue = ref({
  name: '',
  code: '',
  sort: 0,
  status: '0',
})

const formFields = [
  { key: 'name', label: '角色名称', required: true, group: 'basic' },
  { key: 'code', label: '角色编码', required: true, group: 'basic' },
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

const formSections = [
  { key: 'basic', title: '基本信息' },
  { key: 'config', title: '配置' },
]

const columns: DataTableColumns = [
  { title: '角色名称', key: 'name', width: 120 },
  { title: '角色编码', key: 'code', width: 120 },
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
  { title: '创建时间', key: 'createdAt', width: 160 },
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
              { text: true, type: 'primary', onClick: () => handleEdit(row) },
              { default: () => '编辑' },
            ),
            h(
              NPopconfirm,
              { onPositiveClick: () => handleDelete(row.id as string) },
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

async function request() {
  const result = await getSystemRoleList()
  return { items: result as unknown as Record<string, unknown>[], total: result.length }
}

function handleAdd() {
  editingRole.value = null
  formValue.value = { name: '', code: '', sort: 0, status: '0' }
  showModal.value = true
}

function handleEdit(row: Record<string, unknown>) {
  editingRole.value = row
  formValue.value = {
    name: row.name as string,
    code: row.code as string,
    sort: row.sort as number,
    status: row.status as string,
  }
  showModal.value = true
}

async function handleDelete(id: string) {
  await deleteSystemRole(id)
  proTableRef.value?.refresh()
}

async function handleSubmit() {
  if (editingRole.value) {
    await updateSystemRole(editingRole.value.id as string, {
      ...formValue.value,
      status: formValue.value.status as '0' | '1',
    })
  } else {
    await createSystemRole({
      ...formValue.value,
      status: formValue.value.status as '0' | '1',
    })
  }
  showModal.value = false
  proTableRef.value?.refresh()
}
</script>

<template>
  <ProTable ref="proTableRef" :columns="columns" :request="request" title="角色管理">
    <template #toolbar>
      <n-button type="primary" @click="handleAdd">新增角色</n-button>
    </template>
  </ProTable>

  <ProModalForm
    v-model:show="showModal"
    :title="editingRole ? '编辑角色' : '新增角色'"
    :fields="formFields"
    :sections="formSections"
    :model="formValue"
    @update:model="(val) => (formValue = val as typeof formValue)"
    @submit="handleSubmit"
  />
</template>
