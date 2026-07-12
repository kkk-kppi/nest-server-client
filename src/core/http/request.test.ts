import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { AxiosError } from 'axios'
import { del, get, patch, post, put, request, toAppHttpError } from './request'

const { requestMock } = vi.hoisted(() => ({
  requestMock: vi.fn(),
}))

vi.mock('./client', () => ({
  http: {
    request: requestMock,
  },
}))

beforeEach(() => {
  requestMock.mockReset()
})

function createAxiosLikeError(partial: Partial<AxiosError>): AxiosError {
  return {
    name: 'AxiosError',
    message: 'request failed',
    config: {},
    isAxiosError: true,
    toJSON: () => ({}),
    ...partial,
  } as AxiosError
}

describe('toAppHttpError', () => {
  it('classifies unknown non-axios error', () => {
    const result = toAppHttpError(new Error('plain error'))
    expect(result.kind).toBe('unknown')
  })

  it('classifies canceled request', () => {
    const error = createAxiosLikeError({ code: 'ERR_CANCELED' })
    const result = toAppHttpError(error)
    expect(result.kind).toBe('canceled')
  })

  it('classifies timeout request', () => {
    const error = createAxiosLikeError({ code: 'ECONNABORTED' })
    const result = toAppHttpError(error)
    expect(result.kind).toBe('timeout')
  })

  it('classifies network request', () => {
    const error = createAxiosLikeError({})
    const result = toAppHttpError(error)
    expect(result.kind).toBe('network')
  })

  it('classifies server request', () => {
    const error = createAxiosLikeError({
      response: {
        status: 503,
        data: { code: 503, message: 'server', data: null },
      } as AxiosError['response'],
    })
    const result = toAppHttpError(error)
    expect(result.kind).toBe('server')
    expect(result.status).toBe(503)
  })

  it('classifies unknown axios response error', () => {
    const error = createAxiosLikeError({
      response: {
        status: 400,
        data: { code: 400, message: 'bad request', data: null },
      } as AxiosError['response'],
    })
    const result = toAppHttpError(error)
    expect(result.kind).toBe('unknown')
    expect(result.status).toBe(400)
  })
})

describe('request', () => {
  it('unwraps api response payload', async () => {
    requestMock.mockResolvedValueOnce({
      data: { code: 0, message: 'ok', data: { id: 1 } },
    })

    const result = await request<{ id: number }>({ url: '/x', method: 'get' })
    expect(result).toEqual({ id: 1 })
  })

  it('returns raw response payload', async () => {
    requestMock.mockResolvedValueOnce({
      data: { id: 2 },
    })

    const result = await request<{ id: number }>({ url: '/x', method: 'get' })
    expect(result).toEqual({ id: 2 })
  })

  it('throws normalized error when request fails', async () => {
    requestMock.mockRejectedValueOnce(createAxiosLikeError({ code: 'ECONNABORTED' }))
    await expect(request({ url: '/x', method: 'get' })).rejects.toMatchObject({
      kind: 'timeout',
    })
  })

  it('rejects business error codes', async () => {
    requestMock.mockResolvedValueOnce({
      data: { code: 1001, message: 'Invalid parameter', data: null },
    })

    await expect(request({ url: '/x', method: 'get' })).rejects.toMatchObject({
      kind: 'server',
      status: 1001,
    })
  })

  it('uses custom success code', async () => {
    requestMock.mockResolvedValueOnce({
      data: { code: 200, message: 'ok', data: { id: 3 } },
    })

    const result = await request<{ id: number }>({
      url: '/x',
      method: 'get',
      endpoint: { successCode: 200 },
    })
    expect(result).toEqual({ id: 3 })
  })

  it('uses custom response parser', async () => {
    requestMock.mockResolvedValueOnce({
      data: { code: 0, message: 'ok', data: { items: [1, 2, 3] } },
    })

    const parser = (data: unknown) => (data as { items: number[] }).items
    const result = await request<number[]>({
      url: '/x',
      method: 'get',
      endpoint: { responseParser: parser },
    })
    expect(result).toEqual([1, 2, 3])
  })
})

describe('http method wrappers', () => {
  it('maps get to request with get method', async () => {
    requestMock.mockResolvedValueOnce({ data: {} })
    await get('/users')
    expect(requestMock).toHaveBeenLastCalledWith({ method: 'get', url: '/users' })
  })

  it('maps post with data payload', async () => {
    requestMock.mockResolvedValueOnce({ data: {} })
    await post('/users', { name: 'demo' })
    expect(requestMock).toHaveBeenLastCalledWith({
      method: 'post',
      url: '/users',
      data: { name: 'demo' },
    })
  })

  it('maps put with data payload', async () => {
    requestMock.mockResolvedValueOnce({ data: {} })
    await put('/users/1', { name: 'next' })
    expect(requestMock).toHaveBeenLastCalledWith({
      method: 'put',
      url: '/users/1',
      data: { name: 'next' },
    })
  })

  it('maps patch with data payload', async () => {
    requestMock.mockResolvedValueOnce({ data: {} })
    await patch('/users/1', { enabled: true })
    expect(requestMock).toHaveBeenLastCalledWith({
      method: 'patch',
      url: '/users/1',
      data: { enabled: true },
    })
  })

  it('maps delete to request with delete method', async () => {
    requestMock.mockResolvedValueOnce({ data: {} })
    await del('/users/1')
    expect(requestMock).toHaveBeenLastCalledWith({ method: 'delete', url: '/users/1' })
  })
})
