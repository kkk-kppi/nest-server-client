<script setup lang="ts">
import { ref, h } from 'vue'
import { NButton, NSpace, NTag, NPopconfirm, NModal } from 'naive-ui'
import ProTable from '@/shared/components/pro/ProTable.vue'
import ProForm from '@/shared/components/pro/ProForm.vue'
import { useMutation } from '@/shared/composables/useMutation'
import { usePermission } from '@/features/auth/usePermission'
import {
  getSystemUserPage,
  createSystemUser,
  updateSystemUser,
  deleteSystemUser,
} from '@/features/system/api'
import type { SystemUserData } from '@/features/system/api'

type UserRow = SystemUserData['items'][number]

const proTableRef = ref()
const proFormRef = ref()
const showModal = ref(false)
const editingUser = ref<UserRow | null>(null)
const formValue = ref<{
  username: string
  nickname: string
  email: string
  phone: string
  status: '0' | '1'
  roles: string[]
}>({
  username: '',
  nickname: '',
  email: '',
  phone: '',
  status: '0',
  roles: ['viewer'],
})

const { canCreateSystem, canUpdateSystem, canDeleteSystem } = usePermission()

const createMutation = useMutation({
  mutationFn: (data: typeof formValue.value) =>
    createSystemUser({
      ...data,
      status: data.status as '0' | '1',
    }),
  onSuccess: () => {
    showModal.value = false
    proTableRef.value?.refresh()
  },
})
const updateMutation = useMutation({
  mutationFn: (data: typeof formValue.value) =>
    updateSystemUser(editingUser.value!.id, {
      ...data,
      status: data.status as '0' | '1',
    }),
  onSuccess: () => {
    showModal.value = false
    proTableRef.value?.refresh()
  },
})

const deleteMutation = useMutation({
  mutationFn: deleteSystemUser,
  onSuccess: () => {
    proTableRef.value?.refresh()
  },
})

const columns: Array<{
  title: string
  key: string
  width?: number
  render?: (row: UserRow) => unknown
}> = [
  { title: '用户名', key: 'username', width: 120 },
  { title: '昵称', key: 'nickname', width: 120 },
  { title: '邮箱', key: 'email', width: 180 },
  { title: '手机', key: 'phone', width: 140 },
  {
    title: '状态',
    key: 'status',
    width: 80,
    render: (row: UserRow) =>
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
    render: (row: UserRow) =>
      h(
        NSpace,
        { size: 'small' },
        {
          default: () => [
            canUpdateSystem.value
              ? h(
                  NButton,
                  { text: true, type: 'primary', onClick: () => handleEdit(row) },
                  { default: () => '编辑' },
                )
              : null,
            canDeleteSystem.value
              ? h(
                  NPopconfirm,
                  { onPositiveClick: () => deleteMutation.mutate(row.id) },
                  {
                    trigger: () =>
                      h(NButton, { text: true, type: 'error' }, { default: () => '删除' }),
                    default: () => '确认删除？',
                  },
                )
              : null,
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

const formFields = [
  { key: 'username', label: '用户名', required: true },
  { key: 'nickname', label: '昵称', required: true },
  { key: 'email', label: '邮箱' },
  { key: 'phone', label: '手机' },
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

function handleEdit(row: UserRow) {
  editingUser.value = row
  formValue.value = {
    username: row.username,
    nickname: row.nickname,
    email: row.email,
    phone: row.phone,
    status: row.status,
    roles: row.roles,
  }
  showModal.value = true
}

async function handleSubmit() {
  try {
    await proFormRef.value?.validate()
  } catch {
    return
  }

  if (editingUser.value) {
    await updateMutation.mutate(formValue.value)
  } else {
    await createMutation.mutate(formValue.value)
  }
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
      <n-button v-if="canCreateSystem" type="primary" @click="handleAdd"> 新增用户 </n-button>
    </template>
  </ProTable>

  <n-modal
    v-model:show="showModal"
    preset="dialog"
    :title="editingUser ? '编辑用户' : '新增用户'"
    style="width: 500px"
  >
    <ProForm
      ref="proFormRef"
      :fields="formFields"
      :model="formValue"
      :disabled="createMutation.isLoading.value || updateMutation.isLoading.value"
      @update:model="formValue = $event as typeof formValue"
    >
      <template #action>
        <n-space justify="end">
          <n-button @click="showModal = false">取消</n-button>
          <n-button
            type="primary"
            :loading="createMutation.isLoading.value || updateMutation.isLoading.value"
            @click="handleSubmit"
          >
            确定
          </n-button>
        </n-space>
      </template>
    </ProForm>
  </n-modal>
</template>
