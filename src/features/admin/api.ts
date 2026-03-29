import {
  defineGetEndpoint,
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
