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
  NAlert,
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
    <n-grid :cols="4" :x-gap="16" :y-gap="16" responsive="screen" :item-responsive="true">
      <n-gi span="4 m:2 l:1">
        <n-card>
          <template #header-extra>
            <n-icon size="24" color="var(--color-primary)"><PeopleOutline /></n-icon>
          </template>
          <n-statistic
            v-if="dashboardState.status.value === 'success'"
            label="在线用户"
            :value="dashboard?.onlineUsers ?? 0"
          />
          <n-statistic v-else-if="dashboardState.isError.value" label="在线用户">
            <template #default>
              <span class="text-error">加载失败</span>
            </template>
          </n-statistic>
          <n-statistic v-else label="在线用户" :value="0" />
        </n-card>
      </n-gi>
      <n-gi span="4 m:2 l:1">
        <n-card>
          <template #header-extra>
            <n-icon size="24" color="var(--color-error)"><WarningOutline /></n-icon>
          </template>
          <n-statistic v-if="dashboardState.status.value === 'success'" label="错误率">
            <template #default>
              <span :class="(dashboard?.errorRate ?? 0) > 0.1 ? 'text-error' : 'text-success'">
                {{ dashboard?.errorRate ?? 0 }}%
              </span>
            </template>
          </n-statistic>
          <n-statistic v-else-if="dashboardState.isError.value" label="错误率">
            <template #default>
              <span class="text-error">加载失败</span>
            </template>
          </n-statistic>
          <n-statistic v-else label="错误率" :value="0" />
        </n-card>
      </n-gi>
      <n-gi span="4 m:2 l:1">
        <n-card>
          <template #header-extra>
            <n-icon size="24" color="var(--color-success)"><InformationCircleOutline /></n-icon>
          </template>
          <n-statistic
            v-if="dashboardState.status.value === 'success'"
            label="当前版本"
            :value="dashboard?.releaseVersion ?? '-'"
          />
          <n-statistic v-else-if="dashboardState.isError.value" label="当前版本">
            <template #default>
              <span class="text-error">加载失败</span>
            </template>
          </n-statistic>
          <n-statistic v-else label="当前版本" value="-" />
        </n-card>
      </n-gi>
      <n-gi span="4 m:2 l:1">
        <n-card>
          <template #header-extra>
            <n-icon size="24" color="var(--color-warning)"><DocumentOutline /></n-icon>
          </template>
          <n-statistic
            v-if="dashboardState.status.value === 'success'"
            label="系统状态"
            value="正常"
          />
          <n-statistic v-else-if="dashboardState.isError.value" label="系统状态">
            <template #default>
              <span class="text-error">异常</span>
            </template>
          </n-statistic>
          <n-statistic v-else label="系统状态" value="加载中..." />
        </n-card>
      </n-gi>
    </n-grid>

    <!-- 错误提示 -->
    <n-alert
      v-if="dashboardState.isError.value"
      type="error"
      closable
      @close="dashboardState.reset()"
    >
      {{ dashboardState.errorMessage.value }}
    </n-alert>

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
    class="audit-modal"
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

<style scoped>
.text-error {
  color: var(--color-error);
}

.text-success {
  color: var(--color-success);
}

.audit-modal {
  width: 90%;
  max-width: 500px;
}

@media (max-width: 767px) {
  .audit-modal {
    width: 95%;
  }
}
</style>
