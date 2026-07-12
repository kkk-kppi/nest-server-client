import { beforeEach, describe, expect, it, vi } from 'vitest'
import {
  defineGetEndpoint,
  definePostEndpoint,
  definePutEndpoint,
  defineDeleteEndpoint,
  requestEndpoint,
} from './endpoint'

const { getMock, postMock, putMock, patchMock, delMock } = vi.hoisted(() => ({
  getMock: vi.fn(),
  postMock: vi.fn(),
  putMock: vi.fn(),
  patchMock: vi.fn(),
  delMock: vi.fn(),
}))

vi.mock('./request', () => ({
  get: getMock,
  post: postMock,
  put: putMock,
  patch: patchMock,
  del: delMock,
}))

beforeEach(() => {
  getMock.mockReset()
  postMock.mockReset()
  putMock.mockReset()
  patchMock.mockReset()
  delMock.mockReset()
})

describe('requestEndpoint', () => {
  it('maps get endpoint payload to params', async () => {
    const endpoint = defineGetEndpoint<
      '/api/workspace/tasks',
      {
        items: string[]
      },
      {
        page: number
        pageSize: number
      }
    >('/api/workspace/tasks')
    getMock.mockResolvedValueOnce({ items: [] })

    const result = await requestEndpoint(endpoint, {
      query: {
        page: 1,
        pageSize: 10,
      },
      config: {
        timeout: 2000,
      },
    })

    expect(result).toEqual({ items: [] })
    expect(getMock).toHaveBeenCalledWith('/api/workspace/tasks', {
      params: {
        page: 1,
        pageSize: 10,
      },
      timeout: 2000,
    })
  })

  it('maps post endpoint payload to body', async () => {
    const endpoint = definePostEndpoint<
      '/api/auth/login-by-role',
      {
        accessToken: string
      },
      {
        role: 'admin' | 'editor' | 'viewer'
      }
    >('/api/auth/login-by-role')
    postMock.mockResolvedValueOnce({ accessToken: 'token' })

    const result = await requestEndpoint(endpoint, {
      body: {
        role: 'admin',
      },
      config: {
        timeout: 3000,
      },
    })

    expect(result).toEqual({ accessToken: 'token' })
    expect(postMock).toHaveBeenCalledWith(
      '/api/auth/login-by-role',
      {
        role: 'admin',
      },
      {
        timeout: 3000,
      },
    )
  })

  it('resolves path parameters', async () => {
    const endpoint = definePutEndpoint<'/api/users/:id', void, { name: string }>('/api/users/:id')
    putMock.mockResolvedValueOnce(undefined)

    await requestEndpoint(endpoint, {
      pathParams: { id: '123' },
      body: { name: 'test' },
      config: { timeout: 5000 },
    })

    expect(putMock).toHaveBeenCalledWith('/api/users/123', { name: 'test' }, { timeout: 5000 })
  })

  it('resolves multiple path parameters', async () => {
    const endpoint = defineGetEndpoint<'/api/orgs/:orgId/users/:userId', { name: string }>(
      '/api/orgs/:orgId/users/:userId',
    )
    getMock.mockResolvedValueOnce({ name: 'test' })

    await requestEndpoint(endpoint, {
      pathParams: { orgId: 'org-1', userId: 'user-2' },
      config: { timeout: 5000 },
    })

    expect(getMock).toHaveBeenCalledWith('/api/orgs/org-1/users/user-2', {
      params: undefined,
      timeout: 5000,
    })
  })

  it('throws error for missing path parameters', async () => {
    const endpoint = defineDeleteEndpoint<'/api/users/:id', void>('/api/users/:id')

    await expect(
      requestEndpoint(endpoint, {
        config: { timeout: 5000 },
      }),
    ).rejects.toThrow('Missing path parameter "id"')
  })

  it('throws error for unknown path parameters', async () => {
    const endpoint = defineGetEndpoint<'/api/users/:id', void>('/api/users/:id')

    await expect(
      requestEndpoint(endpoint, {
        pathParams: { id: '123', unknown: 'value' } as { id: string; unknown: string },
        config: { timeout: 5000 },
      }),
    ).rejects.toThrow('Path parameter "unknown" not found')
  })

  it('URL encodes path parameters', async () => {
    const endpoint = defineGetEndpoint<'/api/search/:query', { results: string[] }>(
      '/api/search/:query',
    )
    getMock.mockResolvedValueOnce({ results: [] })

    await requestEndpoint(endpoint, {
      pathParams: { query: 'hello world' },
    })

    expect(getMock).toHaveBeenCalledWith('/api/search/hello%20world', {
      params: undefined,
    })
  })
})
