import { http, HttpResponse } from 'msw'
import type { InferEndpointRequest, InferEndpointResponse, PageResult } from '@/core/http'
import {
  getAdminDashboardEndpoint,
  getAuditLogPageEndpoint,
  type AuditLogPageData,
  type AuditLogPageQuery,
} from '@/features/admin/api'
import { loginByRoleEndpoint, type LoginPayload, type LoginResult } from '@/features/auth/api'
import {
  getWorkspaceSummaryEndpoint,
  getWorkspaceTaskPageEndpoint,
  type WorkspaceSummaryData,
  type WorkspaceTaskPageData,
  type WorkspaceTaskPageQuery,
} from '@/features/workspace/api'

const workspaceSummary: WorkspaceSummaryData = {
  projectName: 'Nest Server Client',
  owner: 'lazason',
  taskCount: 12,
}

type WorkspaceTask = WorkspaceTaskPageData['items'][number]

const workspaceTasks: WorkspaceTask[] = [
  { id: 't-1', name: '搭建HTTP层', status: 'done' },
  { id: 't-2', name: '接入权限守卫', status: 'doing' },
  { id: 't-3', name: '补充单元测试', status: 'todo' },
  { id: 't-4', name: '完善CI流程', status: 'todo' },
]

const adminDashboard: InferEndpointResponse<typeof getAdminDashboardEndpoint> = {
  onlineUsers: 18,
  errorRate: 0.12,
  releaseVersion: 'v0.1.0',
}

type AuditLogItem = AuditLogPageData['items'][number]

const auditLogs: AuditLogItem[] = [
  { id: 'a-1', operator: 'admin', action: '创建路由策略', createdAt: '2026-03-20 10:20:00' },
  { id: 'a-2', operator: 'editor', action: '发布页面配置', createdAt: '2026-03-21 09:15:00' },
  { id: 'a-3', operator: 'admin', action: '调整权限规则', createdAt: '2026-03-22 16:30:00' },
  { id: 'a-4', operator: 'admin', action: '触发回滚', createdAt: '2026-03-23 08:45:00' },
]

const loginMap: Record<LoginPayload['role'], LoginResult> = {
  admin: {
    accessToken: 'admin-token',
    roles: ['admin'],
    permissions: ['workspace:read', 'admin:read'],
  },
  editor: {
    accessToken: 'editor-token',
    roles: ['editor'],
    permissions: ['workspace:read'],
  },
  viewer: {
    accessToken: 'viewer-token',
    roles: ['viewer'],
    permissions: ['workspace:read'],
  },
}

function resolvePositiveInt(value: string | null, fallback: number) {
  const parsed = Number.parseInt(value ?? '', 10)
  if (!Number.isFinite(parsed) || parsed <= 0) {
    return fallback
  }
  return parsed
}

function resolvePageResult<TItem>(
  items: TItem[],
  query: {
    page: number
    pageSize: number
  },
): PageResult<TItem> {
  const start = (query.page - 1) * query.pageSize
  const end = start + query.pageSize
  return {
    items: items.slice(start, end),
    meta: {
      page: query.page,
      pageSize: query.pageSize,
      total: items.length,
    },
  }
}

function resolvePageQuery<TQuery extends { page: number; pageSize: number }>(
  request: Request,
): TQuery {
  const page = resolvePositiveInt(new URL(request.url).searchParams.get('page'), 1)
  const pageSize = resolvePositiveInt(new URL(request.url).searchParams.get('pageSize'), 10)
  return {
    page,
    pageSize,
  } as TQuery
}

function resolveMockPath(path: string) {
  return `*${path}`
}

export const handlers = [
  http.get(resolveMockPath(getWorkspaceSummaryEndpoint.path), () => {
    return HttpResponse.json(workspaceSummary)
  }),
  http.get(resolveMockPath(getWorkspaceTaskPageEndpoint.path), ({ request }) => {
    const query = resolvePageQuery<WorkspaceTaskPageQuery>(request)
    if (query.page === 500) {
      return HttpResponse.json(
        {
          message: 'mock server error',
        },
        { status: 500 },
      )
    }
    return HttpResponse.json(resolvePageResult(workspaceTasks, query))
  }),
  http.get(resolveMockPath(getAdminDashboardEndpoint.path), () => {
    return HttpResponse.json(adminDashboard)
  }),
  http.get(resolveMockPath(getAuditLogPageEndpoint.path), ({ request }) => {
    const query = resolvePageQuery<AuditLogPageQuery>(request)
    return HttpResponse.json(resolvePageResult(auditLogs, query))
  }),
  http.post(resolveMockPath(loginByRoleEndpoint.path), async ({ request }) => {
    const payload = (await request.json()) as InferEndpointRequest<typeof loginByRoleEndpoint>
    return HttpResponse.json(loginMap[payload.role])
  }),
]
