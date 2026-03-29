import {
  defineGetEndpoint,
  requestEndpoint,
  type InferEndpointRequest,
  type InferEndpointResponse,
  type PageResult,
} from '@/core/http'

interface WorkspaceSummary {
  projectName: string
  owner: string
  taskCount: number
}

interface WorkspaceTask {
  id: string
  name: string
  status: 'todo' | 'doing' | 'done'
}

export const getWorkspaceSummaryEndpoint = defineGetEndpoint<
  '/api/workspace/summary',
  WorkspaceSummary
>('/api/workspace/summary')

export const getWorkspaceTaskPageEndpoint = defineGetEndpoint<
  '/api/workspace/tasks',
  PageResult<WorkspaceTask>,
  {
    page: number
    pageSize: number
  }
>('/api/workspace/tasks')

export type WorkspaceSummaryData = InferEndpointResponse<typeof getWorkspaceSummaryEndpoint>
export type WorkspaceTaskPageQuery = InferEndpointRequest<typeof getWorkspaceTaskPageEndpoint>
export type WorkspaceTaskPageData = InferEndpointResponse<typeof getWorkspaceTaskPageEndpoint>

export async function getWorkspaceSummary() {
  return requestEndpoint(getWorkspaceSummaryEndpoint, {
    config: {
      timeout: 8000,
    },
  })
}

export async function getWorkspaceTaskPage(query: WorkspaceTaskPageQuery) {
  return requestEndpoint(getWorkspaceTaskPageEndpoint, {
    payload: query,
    config: {
      timeout: 8000,
    },
  })
}
