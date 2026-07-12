import { ref, computed } from 'vue'

export type MutationStatus = 'idle' | 'loading' | 'success' | 'error'

interface UseMutationOptions<TData, TVariables> {
  mutationFn: (variables: TVariables) => Promise<TData>
  onSuccess?: (data: TData, variables: TVariables) => void
  onError?: (error: Error, variables: TVariables) => void
  onSettled?: (data: TData | null, error: Error | null, variables: TVariables) => void
}

export function useMutation<TData, TVariables = void>(
  options: UseMutationOptions<TData, TVariables>,
) {
  const status = ref<MutationStatus>('idle')
  const data = ref<TData | null>(null)
  const error = ref<Error | null>(null)
  const isLoading = computed(() => status.value === 'loading')
  const isError = computed(() => status.value === 'error')
  const isSuccess = computed(() => status.value === 'success')

  let mutationId = 0

  async function mutate(variables: TVariables) {
    const id = ++mutationId

    status.value = 'loading'
    error.value = null

    try {
      const result = await options.mutationFn(variables)

      if (id !== mutationId) return result

      data.value = result
      status.value = 'success'
      options.onSuccess?.(result, variables)
      options.onSettled?.(result, null, variables)

      return result
    } catch (err) {
      if (id !== mutationId) return null

      const errorObj = err instanceof Error ? err : new Error(String(err))
      error.value = errorObj
      status.value = 'error'
      options.onError?.(errorObj, variables)
      options.onSettled?.(null, errorObj, variables)

      return null
    }
  }

  function reset() {
    status.value = 'idle'
    data.value = null
    error.value = null
    mutationId++
  }

  return {
    mutate,
    reset,
    status,
    data,
    error,
    isLoading,
    isError,
    isSuccess,
  }
}
