import { get } from '@/core/http'
import { appEnv } from '@/core/config/env'
import type { PageQuery, PageResult } from '@/core/http'

export interface WorkspaceSummary {
  projectName: string
  owner: string
  taskCount: number
}

export interface WorkspaceTask {
  id: string
  name: string
  status: 'todo' | 'doing' | 'done'
}

const mockWorkspaceSummary: WorkspaceSummary = {
  projectName: 'Nest Server Client',
  owner: 'lazason',
  taskCount: 12,
}

const mockWorkspaceTasks: WorkspaceTask[] = [
  { id: 't-1', name: '搭建HTTP层', status: 'done' },
  { id: 't-2', name: '接入权限守卫', status: 'doing' },
  { id: 't-3', name: '补充单元测试', status: 'todo' },
  { id: 't-4', name: '完善CI流程', status: 'todo' },
]

export async function getWorkspaceSummary() {
  if (appEnv.mode !== 'production') {
    return Promise.resolve(mockWorkspaceSummary)
  }

  return get<WorkspaceSummary>('/api/workspace/summary', {
    timeout: 8000,
  })
}

export async function getWorkspaceTaskPage(query: PageQuery) {
  if (appEnv.mode !== 'production') {
    const start = (query.page - 1) * query.pageSize
    const end = start + query.pageSize
    const pageItems = mockWorkspaceTasks.slice(start, end)
    const result: PageResult<WorkspaceTask> = {
      items: pageItems,
      meta: {
        page: query.page,
        pageSize: query.pageSize,
        total: mockWorkspaceTasks.length,
      },
    }
    return Promise.resolve(result)
  }

  return get<PageResult<WorkspaceTask>>('/api/workspace/tasks', {
    params: query,
    timeout: 8000,
  })
}
