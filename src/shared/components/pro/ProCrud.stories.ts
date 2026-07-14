import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { h } from 'vue'
import { NTag } from 'naive-ui'
import ProCrud from './ProCrud.vue'

const meta: Meta<typeof ProCrud> = {
  title: 'Pro/ProCrud',
  component: ProCrud,
  argTypes: {
    title: { control: 'text' },
    pagination: { control: 'boolean' },
    pageSize: { control: 'number' },
    deleteConfirmType: {
      control: 'select',
      options: ['modal', 'popconfirm'],
    },
  },
}

export default meta
type Story = StoryObj<typeof meta>

const mockColumns = [
  { title: 'ID', key: 'id', width: 80 },
  { title: '名称', key: 'name', width: 150 },
  {
    title: '状态',
    key: 'status',
    width: 100,
    render: (row: Record<string, unknown>) => {
      const statusMap: Record<string, { label: string; type: 'info' | 'success' | 'warning' }> = {
        todo: { label: '待办', type: 'info' },
        doing: { label: '进行中', type: 'warning' },
        done: { label: '已完成', type: 'success' },
      }
      const status = statusMap[row.status as string] || statusMap.todo
      return h(NTag, { type: status.type, size: 'small' }, { default: () => status.label })
    },
  },
  { title: '创建时间', key: 'createdAt', width: 180 },
]

const mockData = [
  { id: '1', name: '任务一', status: 'done', createdAt: '2026-01-01' },
  { id: '2', name: '任务二', status: 'doing', createdAt: '2026-01-02' },
  { id: '3', name: '任务三', status: 'todo', createdAt: '2026-01-03' },
]

const mockFormFields = [
  { key: 'name', label: '任务名称', required: true },
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

async function mockRequest() {
  await new Promise((resolve) => setTimeout(resolve, 500))
  return { items: mockData, total: mockData.length }
}

async function mockCreateFn(data: Record<string, unknown>) {
  await new Promise((resolve) => setTimeout(resolve, 300))
  console.log('Create:', data)
}

async function mockUpdateFn(id: string, data: Record<string, unknown>) {
  await new Promise((resolve) => setTimeout(resolve, 300))
  console.log('Update:', id, data)
}

async function mockDeleteFn(id: string) {
  await new Promise((resolve) => setTimeout(resolve, 300))
  console.log('Delete:', id)
}

export const Default: Story = {
  args: {
    title: '任务管理',
    columns: mockColumns,
    request: mockRequest,
    formFields: mockFormFields,
    createFn: mockCreateFn,
    updateFn: mockUpdateFn,
    deleteFn: mockDeleteFn,
    pagination: true,
    pageSize: 10,
  },
}

export const WithSearch: Story = {
  args: {
    title: '带搜索的任务管理',
    columns: mockColumns,
    request: mockRequest,
    formFields: mockFormFields,
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
    createFn: mockCreateFn,
    updateFn: mockUpdateFn,
    deleteFn: mockDeleteFn,
  },
}

export const WithPopconfirm: Story = {
  args: {
    title: 'Popconfirm 确认删除',
    columns: mockColumns,
    request: mockRequest,
    formFields: mockFormFields,
    createFn: mockCreateFn,
    updateFn: mockUpdateFn,
    deleteFn: mockDeleteFn,
    deleteConfirmType: 'popconfirm',
  },
}

export const WithBatchDelete: Story = {
  args: {
    title: '批量删除',
    columns: mockColumns,
    request: mockRequest,
    formFields: mockFormFields,
    createFn: mockCreateFn,
    updateFn: mockUpdateFn,
    deleteFn: mockDeleteFn,
    batchDeleteFn: async (ids: string[]) => {
      await new Promise((resolve) => setTimeout(resolve, 300))
      console.log('Batch delete:', ids)
    },
  },
}

export const WithPermission: Story = {
  args: {
    title: '权限控制',
    columns: mockColumns,
    request: mockRequest,
    formFields: mockFormFields,
    createFn: mockCreateFn,
    updateFn: mockUpdateFn,
    deleteFn: mockDeleteFn,
    permission: {
      create: 'task:create',
      update: 'task:update',
      delete: 'task:delete',
    },
  },
}
