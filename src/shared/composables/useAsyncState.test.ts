import { describe, expect, it } from 'vitest'
import { useAsyncState } from './useAsyncState'

describe('useAsyncState', () => {
  it('updates data on success', async () => {
    const state = useAsyncState<number>()
    const result = await state.run(async () => 7)

    expect(result).toBe(7)
    expect(state.data.value).toBe(7)
    expect(state.errorMessage.value).toBe('')
    expect(state.isLoading.value).toBe(false)
    expect(state.status.value).toBe('success')
  })

  it('sets error message on failure', async () => {
    const state = useAsyncState<number>()
    const result = await state.run(async () => {
      throw new Error('failed')
    })

    expect(result).toBeNull()
    expect(state.data.value).toBeNull()
    expect(state.errorMessage.value).toBe('failed')
    expect(state.isLoading.value).toBe(false)
    expect(state.status.value).toBe('error')
    expect(state.isError.value).toBe(true)
  })

  it('ignores stale task result', async () => {
    const state = useAsyncState<number>()
    const firstResolver = {
      resolve: null as ((value: number) => void) | null,
    }
    const firstPromise = new Promise<number>((resolve) => {
      firstResolver.resolve = resolve
    })

    const firstTask = state.run(() => firstPromise)
    const secondTask = state.run(async () => 2)

    firstResolver.resolve?.(1)

    const firstResult = await firstTask
    const secondResult = await secondTask

    expect(firstResult).toBeNull()
    expect(secondResult).toBe(2)
    expect(state.data.value).toBe(2)
    // Status should be success because the second task completed
    expect(state.status.value).toBe('success')
  })

  it('starts with idle status', () => {
    const state = useAsyncState<number>()
    expect(state.status.value).toBe('idle')
    expect(state.isIdle.value).toBe(true)
    expect(state.hasData.value).toBe(false)
  })

  it('has loading status during request', async () => {
    const state = useAsyncState<number>()
    let resolvePromise: (value: number) => void
    const promise = new Promise<number>((resolve) => {
      resolvePromise = resolve
    })

    const runPromise = state.run(() => promise)

    // Should be loading
    expect(state.status.value).toBe('loading')
    expect(state.isLoading.value).toBe(true)

    resolvePromise!(42)
    await runPromise

    // Should be success
    expect(state.status.value).toBe('success')
    expect(state.isLoading.value).toBe(false)
  })

  it('maintains data on error when initialData provided', async () => {
    const state = useAsyncState<number>({ initialData: 10 })
    expect(state.status.value).toBe('success')
    expect(state.hasData.value).toBe(true)

    await state.run(async () => {
      throw new Error('failed')
    })

    // Data should still be available
    expect(state.data.value).toBe(10)
    expect(state.status.value).toBe('error')
    expect(state.hasData.value).toBe(true)
  })

  it('resets to idle when no initial data', () => {
    const state = useAsyncState<number>()
    state.reset()
    expect(state.status.value).toBe('idle')
    expect(state.isIdle.value).toBe(true)
  })

  it('resets to success when initial data provided', () => {
    const state = useAsyncState<number>({ initialData: 5 })
    state.reset()
    expect(state.status.value).toBe('success')
    expect(state.data.value).toBe(5)
  })
})
