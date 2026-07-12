import { describe, it, expect, vi } from 'vitest'
import { useMutation } from './useMutation'

describe('useMutation', () => {
  it('calls mutationFn and returns result', async () => {
    const mutationFn = vi.fn().mockResolvedValue('result')
    const { mutate, data, status } = useMutation({ mutationFn })

    const result = await mutate(undefined)

    expect(result).toBe('result')
    expect(data.value).toBe('result')
    expect(status.value).toBe('success')
    expect(mutationFn).toHaveBeenCalledTimes(1)
  })

  it('handles errors', async () => {
    const error = new Error('test error')
    const mutationFn = vi.fn().mockRejectedValue(error)
    const onError = vi.fn()
    const { mutate, error: errorRef, status } = useMutation({ mutationFn, onError })

    const result = await mutate(undefined)

    expect(result).toBeNull()
    expect(errorRef.value).toBe(error)
    expect(status.value).toBe('error')
    expect(onError).toHaveBeenCalledWith(error, undefined)
  })

  it('calls onSuccess callback', async () => {
    const mutationFn = vi.fn().mockResolvedValue('result')
    const onSuccess = vi.fn()
    const { mutate } = useMutation({ mutationFn, onSuccess })

    await mutate('variables')

    expect(onSuccess).toHaveBeenCalledWith('result', 'variables')
  })

  it('calls onSettled callback on success', async () => {
    const mutationFn = vi.fn().mockResolvedValue('result')
    const onSettled = vi.fn()
    const { mutate } = useMutation({ mutationFn, onSettled })

    await mutate('variables')

    expect(onSettled).toHaveBeenCalledWith('result', null, 'variables')
  })

  it('calls onSettled callback on error', async () => {
    const error = new Error('test error')
    const mutationFn = vi.fn().mockRejectedValue(error)
    const onSettled = vi.fn()
    const { mutate } = useMutation({ mutationFn, onSettled })

    await mutate('variables')

    expect(onSettled).toHaveBeenCalledWith(null, error, 'variables')
  })

  it('sets loading state', async () => {
    let resolve: (value: unknown) => void
    const mutationFn = vi.fn().mockImplementation(
      () =>
        new Promise((r) => {
          resolve = r
        }),
    )
    const { mutate, isLoading } = useMutation({ mutationFn })

    expect(isLoading.value).toBe(false)

    const promise = mutate(undefined)
    expect(isLoading.value).toBe(true)

    resolve!('result')
    await promise

    expect(isLoading.value).toBe(false)
  })

  it('resets state', async () => {
    const mutationFn = vi.fn().mockResolvedValue('result')
    const { mutate, reset, data, status, error } = useMutation({ mutationFn })

    await mutate(undefined)
    expect(data.value).toBe('result')
    expect(status.value).toBe('success')

    reset()

    expect(data.value).toBeNull()
    expect(status.value).toBe('idle')
    expect(error.value).toBeNull()
  })

  it('ignores stale responses', async () => {
    let resolveFirst: (value: unknown) => void
    let resolveSecond: (value: unknown) => void
    let callCount = 0

    const mutationFn = vi.fn().mockImplementation(() => {
      callCount++
      if (callCount === 1) {
        return new Promise((r) => {
          resolveFirst = r
        })
      }
      return new Promise((r) => {
        resolveSecond = r
      })
    })

    const { mutate, data } = useMutation({ mutationFn })

    const promise1 = mutate('first')
    const promise2 = mutate('second')

    resolveSecond!('second-result')
    resolveFirst!('first-result')

    await promise1
    await promise2

    expect(data.value).toBe('second-result')
  })
})
