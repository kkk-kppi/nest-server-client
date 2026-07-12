import { ref, computed } from 'vue'

/**
 * useAsyncState
 *
 * 使用场景：
 * 1) 页面首次加载详情/列表数据，需要统一管理 data + loading + error。
 * 2) 同一个页面连续触发多次异步请求（例如快速切换筛选条件）时，避免旧请求覆盖新结果。
 * 3) 希望把请求状态管理从页面组件中抽离，减少重复样板代码。
 */
export type AsyncStateStatus = 'idle' | 'loading' | 'success' | 'error' | 'stale'

interface UseAsyncStateOptions<TData> {
  initialData?: TData | null
  fallbackErrorMessage?: string
}

/**
 * 将未知异常统一转为用户可展示的错误信息。
 */
function resolveErrorMessage(error: unknown, fallbackErrorMessage: string) {
  if (error instanceof Error && error.message) {
    return error.message
  }

  return fallbackErrorMessage
}

export function useAsyncState<TData>(options: UseAsyncStateOptions<TData> = {}) {
  const data = ref<TData | null>(options.initialData ?? null)
  const isLoading = ref(false)
  const errorMessage = ref('')
  const status = ref<AsyncStateStatus>(options.initialData ? 'success' : 'idle')
  /**
   * 活跃任务编号：
   * 每次 run 时自增，用于判断当前返回结果是否仍然是"最新请求"。
   */
  let activeTaskId = 0

  /**
   * 是否有数据（包括过期数据）
   */
  const hasData = computed(() => data.value !== null)

  /**
   * 是否处于错误状态
   */
  const isError = computed(() => status.value === 'error')

  /**
   * 是否处于加载状态
   */
  const isIdle = computed(() => status.value === 'idle')

  /**
   * 执行异步任务并管理状态。
   *
   * 使用场景：
   * - 列表查询、详情加载、分页请求、提交后刷新等需要统一 loading/error 的操作。
   */
  async function run(task: () => Promise<TData>, fallbackErrorMessage = '请求失败') {
    const taskId = ++activeTaskId
    isLoading.value = true
    status.value = 'loading'
    errorMessage.value = ''
    try {
      const result = await task()
      /**
       * 如果该结果已过期（说明期间又发起了新任务），直接忽略。
       */
      if (taskId !== activeTaskId) {
        return null
      }

      data.value = result
      status.value = 'success'
      return result
    } catch (error) {
      if (taskId !== activeTaskId) {
        return null
      }

      errorMessage.value = resolveErrorMessage(
        error,
        options.fallbackErrorMessage ?? fallbackErrorMessage,
      )
      status.value = 'error'
      return null
    } finally {
      /**
       * 仅由当前活跃任务关闭 loading，避免旧任务 finally 抢先把 loading 置为 false。
       */
      if (taskId === activeTaskId) {
        isLoading.value = false
      }
    }
  }

  /**
   * 重置状态并使当前任务失效。
   *
   * 使用场景：
   * - 页面切换时清空旧状态；
   * - 用户点击"重试/重置"后恢复初始态；
   * - 组件卸载前主动失效旧请求结果。
   */
  function reset(nextData: TData | null = options.initialData ?? null) {
    data.value = nextData
    isLoading.value = false
    errorMessage.value = ''
    status.value = nextData ? 'success' : 'idle'
    activeTaskId += 1
  }

  return {
    data,
    isLoading,
    errorMessage,
    status,
    hasData,
    isError,
    isIdle,
    run,
    reset,
  }
}
