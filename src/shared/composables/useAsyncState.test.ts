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
  })
})
