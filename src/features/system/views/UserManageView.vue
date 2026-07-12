<script setup lang="ts">
import { ref, h } from 'vue'
import { useI18n } from 'vue-i18n'
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

const { t } = useI18n()
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

const columns = [
  { title: t('system.user.username'), key: 'username', width: 120 },
  { title: t('system.user.nickname'), key: 'nickname', width: 120 },
  { title: t('system.user.email'), key: 'email', width: 180 },
  { title: t('system.user.phone'), key: 'phone', width: 140 },
  {
    title: t('system.user.status'),
    key: 'status',
    width: 80,
    render: (row: Record<string, unknown>) => {
      const user = row as unknown as UserRow
      return h(
        NTag,
        { type: user.status === '0' ? 'success' : 'error', size: 'small' },
        { default: () => (user.status === '0' ? t('common.enable') : t('common.disable')) },
      )
    },
  },
  {
    title: t('common.action'),
    key: 'action',
    width: 150,
    render: (row: Record<string, unknown>) => {
      const user = row as unknown as UserRow
      return h(
        NSpace,
        { size: 'small' },
        {
          default: () => [
            canUpdateSystem.value
              ? h(
                  NButton,
                  { text: true, type: 'primary', onClick: () => handleEdit(user) },
                  { default: () => t('common.edit') },
                )
              : null,
            canDeleteSystem.value
              ? h(
                  NPopconfirm,
                  { onPositiveClick: () => deleteMutation.mutate(user.id) },
                  {
                    trigger: () =>
                      h(
                        NButton,
                        { text: true, type: 'error' },
                        { default: () => t('common.delete') },
                      ),
                    default: () => t('system.user.confirmDelete'),
                  },
                )
              : null,
          ],
        },
      )
    },
  },
]

const searchFields = [
  { key: 'username', label: t('system.user.username') },
  {
    key: 'status',
    label: t('system.user.status'),
    type: 'select' as const,
    options: [
      { label: t('common.enable'), value: '0' },
      { label: t('common.disable'), value: '1' },
    ],
  },
]

const formFields = [
  { key: 'username', label: t('system.user.username'), required: true },
  { key: 'nickname', label: t('system.user.nickname'), required: true },
  { key: 'email', label: t('system.user.email') },
  { key: 'phone', label: t('system.user.phone') },
  {
    key: 'status',
    label: t('system.user.status'),
    type: 'select' as const,
    options: [
      { label: t('common.enable'), value: '0' },
      { label: t('common.disable'), value: '1' },
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
    :title="t('system.user.title')"
  >
    <template #toolbar>
      <n-button v-if="canCreateSystem" type="primary" @click="handleAdd">
        {{ t('system.user.addUser') }}
      </n-button>
    </template>
  </ProTable>

  <n-modal
    v-model:show="showModal"
    preset="dialog"
    :title="editingUser ? t('system.user.editUser') : t('system.user.addUser')"
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
          <n-button @click="showModal = false">{{ t('common.cancel') }}</n-button>
          <n-button
            type="primary"
            :loading="createMutation.isLoading.value || updateMutation.isLoading.value"
            @click="handleSubmit"
          >
            {{ t('common.confirm') }}
          </n-button>
        </n-space>
      </template>
    </ProForm>
  </n-modal>
</template>
