<script setup lang="ts">
import { onMounted, ref, h } from 'vue'
import {
  NCard,
  NGrid,
  NGi,
  NStatistic,
  NSpace,
  NButton,
  NPopconfirm,
  NModal,
  NForm,
  NFormItem,
  NInput,
  NIcon,
} from 'naive-ui'
import {
  PeopleOutline,
  WarningOutline,
  InformationCircleOutline,
  DocumentOutline,
  AddOutline,
} from '@vicons/ionicons5'
import {
  getAdminDashboardData,
  getAuditLogPage,
  createAuditLog,
  updateAuditLog,
  deleteAuditLog,
} from '@/features/admin/api'
import { useAsyncState } from '@/shared'
import ProTable from '@/shared/components/pro/ProTable.vue'
import type { DataTableColumns } from 'naive-ui'

const dashboardState = useAsyncState<Awaited<ReturnType<typeof getAdminDashboardData>>>()

const dashboard = dashboardState.data

// 审计日志表单
const showModal = ref(false)
const editingLog = ref<Record<string, unknown> | null>(null)
const formValue = ref({
  operator: '',
  action: '',
})

const proTableRef = ref()

const columns: DataTableColumns = [
  { title: '日志ID', key: 'id', width: 80 },
  { title: '操作人', key: 'operator', width: 120 },
  { title: '操作内容', key: 'action', width: 200 },
  { title: '创建时间', key: 'createdAt', width: 180 },
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
  { key: 'operator', label: '操作人' },
  { key: 'action', label: '操作内容' },
]

async function request(params: Record<string, string | number>) {
  const result = await getAuditLogPage(params as { page: number; pageSize: number })
  return { items: result.items as unknown as Record<string, unknown>[], total: result.meta.total }
}

async function loadAdminDashboard() {
  await dashboardState.run(() => getAdminDashboardData(), '加载管理数据失败')
}

function handleAdd() {
  editingLog.value = null
  formValue.value = { operator: '', action: '' }
  showModal.value = true
}

function handleEdit(row: Record<string, unknown>) {
  editingLog.value = row
  formValue.value = {
    operator: row.operator as string,
    action: row.action as string,
  }
  showModal.value = true
}

async function handleDelete(id: string) {
  await deleteAuditLog(id)
  proTableRef.value?.refresh()
}

async function handleSubmit() {
  if (editingLog.value) {
    await updateAuditLog(editingLog.value.id as string, { ...formValue.value })
  } else {
    await createAuditLog({ ...formValue.value })
  }
  showModal.value = false
  proTableRef.value?.refresh()
}

onMounted(() => {
  void loadAdminDashboard()
})
</script>

<template>
  <n-space vertical :size="16">
    <!-- 仪表盘统计卡片 -->
    <n-grid :cols="4" :x-gap="16" :y-gap="16">
      <n-gi>
        <n-card>
          <template #header-extra>
            <n-icon size="24" color="#2080f0"><PeopleOutline /></n-icon>
          </template>
          <n-statistic label="在线用户" :value="dashboard?.onlineUsers ?? 0" />
        </n-card>
      </n-gi>
      <n-gi>
        <n-card>
          <template #header-extra>
            <n-icon size="24" color="#d03050"><WarningOutline /></n-icon>
          </template>
          <n-statistic label="错误率">
            <template #default>
              <span :style="{ color: (dashboard?.errorRate ?? 0) > 0.1 ? '#d03050' : '#18a058' }">
                {{ dashboard?.errorRate ?? 0 }}%
              </span>
            </template>
          </n-statistic>
        </n-card>
      </n-gi>
      <n-gi>
        <n-card>
          <template #header-extra>
            <n-icon size="24" color="#18a058"><InformationCircleOutline /></n-icon>
          </template>
          <n-statistic label="当前版本" :value="dashboard?.releaseVersion ?? '-'" />
        </n-card>
      </n-gi>
      <n-gi>
        <n-card>
          <template #header-extra>
            <n-icon size="24" color="#f0a020"><DocumentOutline /></n-icon>
          </template>
          <n-statistic label="系统状态" value="正常" />
        </n-card>
      </n-gi>
    </n-grid>

    <!-- 审计日志列表 -->
    <ProTable
      ref="proTableRef"
      :columns="columns"
      :request="request"
      :search-fields="searchFields"
      title="审计日志"
    >
      <template #toolbar>
        <n-button type="primary" @click="handleAdd">
          <template #icon
            ><n-icon><AddOutline /></n-icon
          ></template>
          新增日志
        </n-button>
      </template>
    </ProTable>
  </n-space>

  <!-- 日志弹窗 -->
  <n-modal
    v-model:show="showModal"
    preset="dialog"
    :title="editingLog ? '编辑日志' : '新增日志'"
    style="width: 500px"
  >
    <n-form :model="formValue" label-width="80">
      <n-form-item label="操作人" required>
        <n-input v-model:value="formValue.operator" placeholder="请输入操作人" />
      </n-form-item>
      <n-form-item label="操作内容" required>
        <n-input v-model:value="formValue.action" placeholder="请输入操作内容" />
      </n-form-item>
    </n-form>
    <template #action>
      <n-button @click="showModal = false">取消</n-button>
      <n-button type="primary" @click="handleSubmit">确定</n-button>
    </template>
  </n-modal>
</template>
