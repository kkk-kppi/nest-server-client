import {
  defineGetEndpoint,
  definePostEndpoint,
  definePutEndpoint,
  defineDeleteEndpoint,
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

export const createWorkspaceTaskEndpoint = definePostEndpoint<
  '/api/workspace/tasks',
  void,
  Omit<WorkspaceTask, 'id'>
>('/api/workspace/tasks')

export const updateWorkspaceTaskEndpoint = definePutEndpoint<
  '/api/workspace/tasks/:id',
  void,
  Partial<Omit<WorkspaceTask, 'id'>>
>('/api/workspace/tasks/:id')

export const deleteWorkspaceTaskEndpoint = defineDeleteEndpoint<'/api/workspace/tasks/:id', void>(
  '/api/workspace/tasks/:id',
)

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

export async function createWorkspaceTask(
  data: InferEndpointRequest<typeof createWorkspaceTaskEndpoint>,
) {
  return requestEndpoint(createWorkspaceTaskEndpoint, {
    payload: data,
    config: { timeout: 8000 },
  })
}

export async function updateWorkspaceTask(
  id: string,
  data: InferEndpointRequest<typeof updateWorkspaceTaskEndpoint>,
) {
  const url = updateWorkspaceTaskEndpoint.path.replace(':id', id)
  return requestEndpoint(
    { ...updateWorkspaceTaskEndpoint, path: url },
    {
      payload: data,
      config: { timeout: 8000 },
    },
  )
}

export async function deleteWorkspaceTask(id: string) {
  const url = deleteWorkspaceTaskEndpoint.path.replace(':id', id)
  return requestEndpoint(
    { ...deleteWorkspaceTaskEndpoint, path: url },
    {
      payload: undefined,
      config: { timeout: 8000 },
    },
  )
}
