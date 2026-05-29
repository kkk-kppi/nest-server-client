<script setup lang="ts">
import { ref, h } from 'vue'
import {
  NButton,
  NSpace,
  NTag,
  NPopconfirm,
  NModal,
  NForm,
  NFormItem,
  NInput,
  NSelect,
} from 'naive-ui'
import ProTable from '@/shared/components/pro/ProTable.vue'
import {
  getSystemUserPage,
  createSystemUser,
  updateSystemUser,
  deleteSystemUser,
} from '@/features/system/api'
import type { DataTableColumns } from 'naive-ui'

const proTableRef = ref()
const showModal = ref(false)
const editingUser = ref<Record<string, unknown> | null>(null)
const formValue = ref({
  username: '',
  nickname: '',
  email: '',
  phone: '',
  status: '0',
  roles: ['viewer'],
})

const columns: DataTableColumns = [
  { title: '用户名', key: 'username', width: 120 },
  { title: '昵称', key: 'nickname', width: 120 },
  { title: '邮箱', key: 'email', width: 180 },
  { title: '手机', key: 'phone', width: 140 },
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

const searchFields = [
  { key: 'username', label: '用户名' },
  {
    key: 'status',
    label: '状态',
    type: 'select' as const,
    options: [
      { label: '正常', value: '0' },
      { label: '停用', value: '1' },
    ],
  },
]

async function request(params: Record<string, string | number>) {
  const result = await getSystemUserPage(
    params as { page: number; pageSize: number; username?: string; status?: string },
  )
  return { items: result.items as unknown as Record<string, unknown>[], total: result.meta.total }
}

function handleAdd() {
  editingUser.value = null
  formValue.value = {
    username: '',
    nickname: '',
    email: '',
    phone: '',
    status: '0',
    roles: ['viewer'],
  }
  showModal.value = true
}

function handleEdit(row: Record<string, unknown>) {
  editingUser.value = row
  formValue.value = {
    username: row.username as string,
    nickname: row.nickname as string,
    email: row.email as string,
    phone: row.phone as string,
    status: row.status as string,
    roles: row.roles as string[],
  }
  showModal.value = true
}

async function handleDelete(id: string) {
  await deleteSystemUser(id)
  proTableRef.value?.refresh()
}

async function handleSubmit() {
  if (editingUser.value) {
    await updateSystemUser(editingUser.value.id as string, {
      ...formValue.value,
      status: formValue.value.status as '0' | '1',
    })
  } else {
    await createSystemUser({
      ...formValue.value,
      status: formValue.value.status as '0' | '1',
    })
  }
  showModal.value = false
  proTableRef.value?.refresh()
}
</script>

<template>
  <ProTable
    ref="proTableRef"
    :columns="columns"
    :request="request"
    :search-fields="searchFields"
    title="用户管理"
  >
    <template #toolbar>
      <n-button type="primary" @click="handleAdd">新增用户</n-button>
    </template>
  </ProTable>

  <n-modal
    v-model:show="showModal"
    preset="dialog"
    :title="editingUser ? '编辑用户' : '新增用户'"
    style="width: 500px"
  >
    <n-form :model="formValue" label-width="80">
      <n-form-item label="用户名"><n-input v-model:value="formValue.username" /></n-form-item>
      <n-form-item label="昵称"><n-input v-model:value="formValue.nickname" /></n-form-item>
      <n-form-item label="邮箱"><n-input v-model:value="formValue.email" /></n-form-item>
      <n-form-item label="手机"><n-input v-model:value="formValue.phone" /></n-form-item>
      <n-form-item label="状态">
        <n-select
          v-model:value="formValue.status"
          :options="[
            { label: '正常', value: '0' },
            { label: '停用', value: '1' },
          ]"
        />
      </n-form-item>
    </n-form>
    <template #action>
      <n-button @click="showModal = false">取消</n-button>
      <n-button type="primary" @click="handleSubmit">确定</n-button>
    </template>
  </n-modal>
</template>
