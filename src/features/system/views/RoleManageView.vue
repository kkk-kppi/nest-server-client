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
  NInputNumber,
  NSelect,
} from 'naive-ui'
import ProTable from '@/shared/components/pro/ProTable.vue'
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

  <n-modal
    v-model:show="showModal"
    preset="dialog"
    :title="editingRole ? '编辑角色' : '新增角色'"
    class="role-modal"
  >
    <n-form :model="formValue" label-width="80">
      <n-form-item label="角色名称"><n-input v-model:value="formValue.name" /></n-form-item>
      <n-form-item label="角色编码"><n-input v-model:value="formValue.code" /></n-form-item>
      <n-form-item label="排序"
        ><n-input-number v-model:value="formValue.sort" :min="0"
      /></n-form-item>
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

<style scoped>
.role-modal {
  width: 90%;
  max-width: 500px;
}

@media (max-width: 767px) {
  .role-modal {
    width: 95%;
  }
}
</style>
