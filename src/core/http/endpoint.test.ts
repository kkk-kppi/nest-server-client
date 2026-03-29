import { beforeEach, describe, expect, it, vi } from 'vitest'
import { defineGetEndpoint, definePostEndpoint, requestEndpoint } from './endpoint'

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
      payload: {
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
      payload: {
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
})
