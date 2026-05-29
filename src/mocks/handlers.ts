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
import {
  getSystemUserPageEndpoint,
  createSystemUserEndpoint,
  updateSystemUserEndpoint,
  deleteSystemUserEndpoint,
  getSystemRoleListEndpoint,
  createSystemRoleEndpoint,
  updateSystemRoleEndpoint,
  deleteSystemRoleEndpoint,
  getDictTypeListEndpoint,
  getDictDataListEndpoint,
} from '@/features/system/api'

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

const systemUsers = [
  {
    id: '1',
    username: 'admin',
    nickname: '管理员',
    email: 'admin@example.com',
    phone: '13800000001',
    status: '0' as const,
    roles: ['admin'],
    createdAt: '2026-01-01',
  },
  {
    id: '2',
    username: 'editor',
    nickname: '编辑者',
    email: 'editor@example.com',
    phone: '13800000002',
    status: '0' as const,
    roles: ['editor'],
    createdAt: '2026-01-02',
  },
  {
    id: '3',
    username: 'viewer',
    nickname: '查看者',
    email: 'viewer@example.com',
    phone: '13800000003',
    status: '0' as const,
    roles: ['viewer'],
    createdAt: '2026-01-03',
  },
  {
    id: '4',
    username: 'user04',
    nickname: '用户04',
    email: 'user04@example.com',
    phone: '13800000004',
    status: '1' as const,
    roles: ['viewer'],
    createdAt: '2026-01-04',
  },
  {
    id: '5',
    username: 'user05',
    nickname: '用户05',
    email: 'user05@example.com',
    phone: '13800000005',
    status: '0' as const,
    roles: ['editor'],
    createdAt: '2026-01-05',
  },
]

const systemRoles = [
  {
    id: '1',
    name: '管理员',
    code: 'admin',
    sort: 1,
    status: '0' as const,
    createdAt: '2026-01-01',
  },
  {
    id: '2',
    name: '编辑者',
    code: 'editor',
    sort: 2,
    status: '0' as const,
    createdAt: '2026-01-01',
  },
  {
    id: '3',
    name: '查看者',
    code: 'viewer',
    sort: 3,
    status: '0' as const,
    createdAt: '2026-01-01',
  },
]

const dictTypes = [
  { id: '1', name: '用户状态', code: 'sys_user_status', status: '0' as const },
  { id: '2', name: '通用状态', code: 'sys_normal_disable', status: '0' as const },
  { id: '3', name: '性别', code: 'sys_user_sex', status: '0' as const },
]

const dictData = [
  {
    id: '1',
    label: '正常',
    value: '0',
    sort: 1,
    status: '0' as const,
    typeCode: 'sys_user_status',
  },
  {
    id: '2',
    label: '停用',
    value: '1',
    sort: 2,
    status: '0' as const,
    typeCode: 'sys_user_status',
  },
  {
    id: '3',
    label: '正常',
    value: '0',
    sort: 1,
    status: '0' as const,
    typeCode: 'sys_normal_disable',
  },
  {
    id: '4',
    label: '停用',
    value: '1',
    sort: 2,
    status: '0' as const,
    typeCode: 'sys_normal_disable',
  },
  { id: '5', label: '男', value: '0', sort: 1, status: '0' as const, typeCode: 'sys_user_sex' },
  { id: '6', label: '女', value: '1', sort: 2, status: '0' as const, typeCode: 'sys_user_sex' },
  { id: '7', label: '未知', value: '2', sort: 3, status: '0' as const, typeCode: 'sys_user_sex' },
]

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
  http.get(resolveMockPath(getSystemUserPageEndpoint.path), ({ request }) => {
    const url = new URL(request.url)
    const page = resolvePositiveInt(url.searchParams.get('page'), 1)
    const pageSize = resolvePositiveInt(url.searchParams.get('pageSize'), 10)
    const username = url.searchParams.get('username')
    const status = url.searchParams.get('status')

    let filtered = [...systemUsers]
    if (username) filtered = filtered.filter((u) => u.username.includes(username))
    if (status) filtered = filtered.filter((u) => u.status === status)

    return HttpResponse.json(resolvePageResult(filtered, { page, pageSize }))
  }),
  http.post(resolveMockPath(createSystemUserEndpoint.path), async ({ request }) => {
    const body = (await request.json()) as Omit<(typeof systemUsers)[number], 'id' | 'createdAt'>
    systemUsers.push({
      ...body,
      id: String(systemUsers.length + 1),
      createdAt: new Date().toISOString(),
    })
    return HttpResponse.json(null, { status: 201 })
  }),
  http.put(resolveMockPath(updateSystemUserEndpoint.path), async ({ params, request }) => {
    const body = (await request.json()) as Partial<
      Omit<(typeof systemUsers)[number], 'id' | 'createdAt'>
    >
    const index = systemUsers.findIndex((u) => u.id === params.id)
    if (index !== -1) Object.assign(systemUsers[index], body)
    return HttpResponse.json(null)
  }),
  http.delete(resolveMockPath(deleteSystemUserEndpoint.path), ({ params }) => {
    const index = systemUsers.findIndex((u) => u.id === params.id)
    if (index !== -1) systemUsers.splice(index, 1)
    return HttpResponse.json(null)
  }),
  http.get(resolveMockPath(getSystemRoleListEndpoint.path), () => {
    return HttpResponse.json(systemRoles)
  }),
  http.post(resolveMockPath(createSystemRoleEndpoint.path), async ({ request }) => {
    const body = (await request.json()) as Omit<(typeof systemRoles)[number], 'id' | 'createdAt'>
    systemRoles.push({
      ...body,
      id: String(systemRoles.length + 1),
      createdAt: new Date().toISOString(),
    })
    return HttpResponse.json(null, { status: 201 })
  }),
  http.put(resolveMockPath(updateSystemRoleEndpoint.path), async ({ params, request }) => {
    const body = (await request.json()) as Partial<
      Omit<(typeof systemRoles)[number], 'id' | 'createdAt'>
    >
    const index = systemRoles.findIndex((r) => r.id === params.id)
    if (index !== -1) Object.assign(systemRoles[index], body)
    return HttpResponse.json(null)
  }),
  http.delete(resolveMockPath(deleteSystemRoleEndpoint.path), ({ params }) => {
    const index = systemRoles.findIndex((r) => r.id === params.id)
    if (index !== -1) systemRoles.splice(index, 1)
    return HttpResponse.json(null)
  }),
  http.get(resolveMockPath(getDictTypeListEndpoint.path), () => {
    return HttpResponse.json(dictTypes)
  }),
  http.get(resolveMockPath(getDictDataListEndpoint.path), ({ params }) => {
    const typeCode = params.type as string
    const items = dictData.filter((d) => d.typeCode === typeCode)
    return HttpResponse.json(items)
  }),
]
