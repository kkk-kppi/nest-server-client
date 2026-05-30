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

interface AdminDashboardData {
  onlineUsers: number
  errorRate: number
  releaseVersion: string
}

interface AuditLogItem {
  id: string
  operator: string
  action: string
  createdAt: string
}

export const getAdminDashboardEndpoint = defineGetEndpoint<
  '/api/admin/dashboard',
  AdminDashboardData
>('/api/admin/dashboard')

export const getAuditLogPageEndpoint = defineGetEndpoint<
  '/api/admin/audit-logs',
  PageResult<AuditLogItem>,
  {
    page: number
    pageSize: number
  }
>('/api/admin/audit-logs')

export const createAuditLogEndpoint = definePostEndpoint<
  '/api/admin/audit-logs',
  void,
  Omit<AuditLogItem, 'id' | 'createdAt'>
>('/api/admin/audit-logs')

export const updateAuditLogEndpoint = definePutEndpoint<
  '/api/admin/audit-logs/:id',
  void,
  Partial<Omit<AuditLogItem, 'id' | 'createdAt'>>
>('/api/admin/audit-logs/:id')

export const deleteAuditLogEndpoint = defineDeleteEndpoint<'/api/admin/audit-logs/:id', void>(
  '/api/admin/audit-logs/:id',
)

export type AdminDashboard = InferEndpointResponse<typeof getAdminDashboardEndpoint>
export type AuditLogPageQuery = InferEndpointRequest<typeof getAuditLogPageEndpoint>
export type AuditLogPageData = InferEndpointResponse<typeof getAuditLogPageEndpoint>

export async function getAdminDashboardData() {
  return requestEndpoint(getAdminDashboardEndpoint, {
    config: {
      timeout: 8000,
    },
  })
}

export async function getAuditLogPage(query: AuditLogPageQuery) {
  return requestEndpoint(getAuditLogPageEndpoint, {
    payload: query,
    config: {
      timeout: 8000,
    },
  })
}

export async function createAuditLog(data: InferEndpointRequest<typeof createAuditLogEndpoint>) {
  return requestEndpoint(createAuditLogEndpoint, {
    payload: data,
    config: { timeout: 8000 },
  })
}

export async function updateAuditLog(
  id: string,
  data: InferEndpointRequest<typeof updateAuditLogEndpoint>,
) {
  void id
  return requestEndpoint(updateAuditLogEndpoint, {
    payload: data,
    config: { timeout: 8000 },
  })
}

export async function deleteAuditLog(id: string) {
  void id
  return requestEndpoint(deleteAuditLogEndpoint, {
    payload: undefined,
    config: { timeout: 8000 },
  })
}
