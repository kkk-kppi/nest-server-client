import { get } from '@/core/http'
import { appEnv } from '@/core/config/env'
import type { PageQuery, PageResult } from '@/core/http'

export interface AdminDashboardData {
  onlineUsers: number
  errorRate: number
  releaseVersion: string
}

export interface AuditLogItem {
  id: string
  operator: string
  action: string
  createdAt: string
}

const mockAdminDashboardData: AdminDashboardData = {
  onlineUsers: 18,
  errorRate: 0.12,
  releaseVersion: 'v0.1.0',
}

const mockAuditLogs: AuditLogItem[] = [
  { id: 'a-1', operator: 'admin', action: '创建路由策略', createdAt: '2026-03-20 10:20:00' },
  { id: 'a-2', operator: 'editor', action: '发布页面配置', createdAt: '2026-03-21 09:15:00' },
  { id: 'a-3', operator: 'admin', action: '调整权限规则', createdAt: '2026-03-22 16:30:00' },
  { id: 'a-4', operator: 'admin', action: '触发回滚', createdAt: '2026-03-23 08:45:00' },
]

export async function getAdminDashboardData() {
  if (appEnv.mode !== 'production') {
    return Promise.resolve(mockAdminDashboardData)
  }

  return get<AdminDashboardData>('/api/admin/dashboard', {
    timeout: 8000,
  })
}

export async function getAuditLogPage(query: PageQuery) {
  if (appEnv.mode !== 'production') {
    const start = (query.page - 1) * query.pageSize
    const end = start + query.pageSize
    const result: PageResult<AuditLogItem> = {
      items: mockAuditLogs.slice(start, end),
      meta: {
        page: query.page,
        pageSize: query.pageSize,
        total: mockAuditLogs.length,
      },
    }
    return Promise.resolve(result)
  }

  return get<PageResult<AuditLogItem>>('/api/admin/audit-logs', {
    params: query,
    timeout: 8000,
  })
}
