<script setup lang="ts">
import { onMounted, ref, h } from 'vue'
import {
  NCard,
  NGrid,
  NGi,
  NStatistic,
  NSpace,
  NButton,
  NTag,
  NPopconfirm,
  NModal,
  NForm,
  NFormItem,
  NInput,
  NSelect,
  NIcon,
  NAlert,
} from 'naive-ui'
import {
  FolderOpenOutline,
  CheckmarkCircleOutline,
  TimeOutline,
  PeopleOutline,
  AddOutline,
} from '@vicons/ionicons5'
import {
  getWorkspaceSummary,
  getWorkspaceTaskPage,
  createWorkspaceTask,
  updateWorkspaceTask,
  deleteWorkspaceTask,
} from '@/features/workspace/api'
import { useAsyncState } from '@/shared'
import ProTable from '@/shared/components/pro/ProTable.vue'
import type { DataTableColumns } from 'naive-ui'

const summaryState = useAsyncState<Awaited<ReturnType<typeof getWorkspaceSummary>>>()

const summary = summaryState.data

// 任务表单
const showModal = ref(false)
const editingTask = ref<Record<string, unknown> | null>(null)
const formValue = ref({
  name: '',
  status: 'todo' as 'todo' | 'doing' | 'done',
})

const proTableRef = ref()

const columns: DataTableColumns = [
  { title: '任务ID', key: 'id', width: 80 },
  { title: '任务名称', key: 'name', width: 200 },
  {
    title: '状态',
    key: 'status',
    width: 100,
    render: (row) => {
      const statusMap: Record<string, { label: string; type: 'info' | 'success' | 'warning' }> = {
        todo: { label: '待办', type: 'info' },
        doing: { label: '进行中', type: 'warning' },
        done: { label: '已完成', type: 'success' },
      }
      const status = statusMap[row.status as string] || statusMap.todo
      return h(NTag, { type: status.type, size: 'small' }, { default: () => status.label })
    },
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
  { key: 'name', label: '任务名称' },
  {
    key: 'status',
    label: '状态',
    type: 'select' as const,
    options: [
      { label: '待办', value: 'todo' },
      { label: '进行中', value: 'doing' },
      { label: '已完成', value: 'done' },
    ],
  },
]

async function request(params: Record<string, string | number>) {
  const result = await getWorkspaceTaskPage(params as { page: number; pageSize: number })
  return { items: result.items as unknown as Record<string, unknown>[], total: result.meta.total }
}

async function loadWorkspaceSummary() {
  await summaryState.run(() => getWorkspaceSummary(), '加载工作区数据失败')
}

function handleAdd() {
  editingTask.value = null
  formValue.value = { name: '', status: 'todo' }
  showModal.value = true
}

function handleEdit(row: Record<string, unknown>) {
  editingTask.value = row
  formValue.value = {
    name: row.name as string,
    status: row.status as 'todo' | 'doing' | 'done',
  }
  showModal.value = true
}

async function handleDelete(id: string) {
  await deleteWorkspaceTask(id)
  proTableRef.value?.refresh()
}

async function handleSubmit() {
  if (editingTask.value) {
    await updateWorkspaceTask(editingTask.value.id as string, { ...formValue.value })
  } else {
    await createWorkspaceTask({ ...formValue.value })
  }
  showModal.value = false
  proTableRef.value?.refresh()
}

onMounted(() => {
  void loadWorkspaceSummary()
})
</script>

<template>
  <n-space vertical :size="16">
    <!-- 统计卡片 -->
    <n-grid :cols="4" :x-gap="16" :y-gap="16">
      <n-gi>
        <n-card>
          <template #header-extra>
            <n-icon size="24" color="#18a058"><FolderOpenOutline /></n-icon>
          </template>
          <n-statistic
            v-if="summaryState.status.value === 'success'"
            label="项目名称"
            :value="summary?.projectName ?? '-'"
          />
          <n-statistic v-else-if="summaryState.isError.value" label="项目名称">
            <template #default>
              <span style="color: #d03050">加载失败</span>
            </template>
          </n-statistic>
          <n-statistic v-else label="项目名称" value="-" />
        </n-card>
      </n-gi>
      <n-gi>
        <n-card>
          <template #header-extra>
            <n-icon size="24" color="#2080f0"><PeopleOutline /></n-icon>
          </template>
          <n-statistic
            v-if="summaryState.status.value === 'success'"
            label="负责人"
            :value="summary?.owner ?? '-'"
          />
          <n-statistic v-else-if="summaryState.isError.value" label="负责人">
            <template #default>
              <span style="color: #d03050">加载失败</span>
            </template>
          </n-statistic>
          <n-statistic v-else label="负责人" value="-" />
        </n-card>
      </n-gi>
      <n-gi>
        <n-card>
          <template #header-extra>
            <n-icon size="24" color="#f0a020"><TimeOutline /></n-icon>
          </template>
          <n-statistic
            v-if="summaryState.status.value === 'success'"
            label="任务总数"
            :value="summary?.taskCount ?? 0"
          />
          <n-statistic v-else-if="summaryState.isError.value" label="任务总数">
            <template #default>
              <span style="color: #d03050">加载失败</span>
            </template>
          </n-statistic>
          <n-statistic v-else label="任务总数" :value="0" />
        </n-card>
      </n-gi>
      <n-gi>
        <n-card>
          <template #header-extra>
            <n-icon size="24" color="#18a058"><CheckmarkCircleOutline /></n-icon>
          </template>
          <n-statistic
            v-if="summaryState.status.value === 'success'"
            label="项目状态"
            value="进行中"
          />
          <n-statistic v-else-if="summaryState.isError.value" label="项目状态">
            <template #default>
              <span style="color: #d03050">异常</span>
            </template>
          </n-statistic>
          <n-statistic v-else label="项目状态" value="加载中..." />
        </n-card>
      </n-gi>
    </n-grid>

    <!-- 错误提示 -->
    <n-alert v-if="summaryState.isError.value" type="error" closable @close="summaryState.reset()">
      {{ summaryState.errorMessage.value }}
    </n-alert>

    <!-- 任务列表 -->
    <ProTable
      ref="proTableRef"
      :columns="columns"
      :request="request"
      :search-fields="searchFields"
      title="任务列表"
    >
      <template #toolbar>
        <n-button type="primary" @click="handleAdd">
          <template #icon
            ><n-icon><AddOutline /></n-icon
          ></template>
          新增任务
        </n-button>
      </template>
    </ProTable>
  </n-space>

  <!-- 任务弹窗 -->
  <n-modal
    v-model:show="showModal"
    preset="dialog"
    :title="editingTask ? '编辑任务' : '新增任务'"
    style="width: 500px"
  >
    <n-form :model="formValue" label-width="80">
      <n-form-item label="任务名称" required>
        <n-input v-model:value="formValue.name" placeholder="请输入任务名称" />
      </n-form-item>
      <n-form-item label="状态">
        <n-select
          v-model:value="formValue.status"
          :options="[
            { label: '待办', value: 'todo' },
            { label: '进行中', value: 'doing' },
            { label: '已完成', value: 'done' },
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
