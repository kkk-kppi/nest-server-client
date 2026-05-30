import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { h } from 'vue'
import { NButton, NSpace, NTag } from 'naive-ui'
import ProTable from './ProTable.vue'

const meta: Meta<typeof ProTable> = {
  title: 'Pro/ProTable',
  component: ProTable,
  argTypes: {
    title: { control: 'text' },
    pagination: { control: 'boolean' },
    pageSize: { control: 'number' },
    toolbar: { control: 'boolean' },
  },
}

export default meta
type Story = StoryObj<typeof meta>

const mockColumns = [
  { title: 'ID', key: 'id', width: 80 },
  { title: '名称', key: 'name', width: 150 },
  { title: '状态', key: 'status', width: 100 },
  { title: '创建时间', key: 'createdAt', width: 180 },
]

const mockData = [
  { id: '1', name: '任务一', status: 'done', createdAt: '2026-01-01' },
  { id: '2', name: '任务二', status: 'doing', createdAt: '2026-01-02' },
  { id: '3', name: '任务三', status: 'todo', createdAt: '2026-01-03' },
  { id: '4', name: '任务四', status: 'done', createdAt: '2026-01-04' },
  { id: '5', name: '任务五', status: 'doing', createdAt: '2026-01-05' },
]

async function mockRequest() {
  await new Promise((resolve) => setTimeout(resolve, 500))
  return { items: mockData, total: mockData.length }
}

export const Default: Story = {
  args: {
    title: '任务列表',
    columns: mockColumns,
    request: mockRequest,
    pagination: true,
    pageSize: 10,
    toolbar: true,
  },
}

export const WithSearch: Story = {
  args: {
    title: '带搜索的任务列表',
    columns: mockColumns,
    request: mockRequest,
    searchFields: [
      { key: 'name', label: '任务名称' },
      {
        key: 'status',
        label: '状态',
        type: 'select',
        options: [
          { label: '待办', value: 'todo' },
          { label: '进行中', value: 'doing' },
          { label: '已完成', value: 'done' },
        ],
      },
    ],
    pagination: true,
    pageSize: 10,
    toolbar: true,
  },
}

export const WithCustomToolbar: Story = {
  args: {
    title: '自定义工具栏',
    columns: mockColumns,
    request: mockRequest,
    pagination: true,
    pageSize: 10,
    toolbar: true,
  },
  render: (args) => ({
    components: { ProTable, NButton, NSpace },
    setup() {
      return { args }
    },
    template: `
      <ProTable v-bind="args">
        <template #toolbar>
          <n-space>
            <n-button type="primary">新增</n-button>
            <n-button>导入</n-button>
            <n-button>导出</n-button>
          </n-space>
        </template>
      </ProTable>
    `,
  }),
}

export const WithStatusTag: Story = {
  args: {
    title: '带状态标签',
    columns: [
      { title: 'ID', key: 'id', width: 80 },
      { title: '名称', key: 'name', width: 150 },
      {
        title: '状态',
        key: 'status',
        width: 100,
        render: (row: Record<string, unknown>) => {
          const statusMap: Record<string, { label: string; type: 'info' | 'success' | 'warning' }> =
            {
              todo: { label: '待办', type: 'info' },
              doing: { label: '进行中', type: 'warning' },
              done: { label: '已完成', type: 'success' },
            }
          const status = statusMap[row.status as string] || statusMap.todo
          return h(NTag, { type: status.type, size: 'small' }, { default: () => status.label })
        },
      },
      { title: '创建时间', key: 'createdAt', width: 180 },
    ],
    request: mockRequest,
    pagination: true,
    pageSize: 10,
    toolbar: true,
  },
}

export const WithoutPagination: Story = {
  args: {
    title: '无分页',
    columns: mockColumns,
    request: mockRequest,
    pagination: false,
    toolbar: true,
  },
}

export const Loading: Story = {
  args: {
    title: '加载中',
    columns: mockColumns,
    request: async () => {
      await new Promise((resolve) => setTimeout(resolve, 10000))
      return { items: [], total: 0 }
    },
    pagination: true,
    pageSize: 10,
    toolbar: true,
  },
}
