import { computed, ref } from 'vue'
import { clampPage, getTotalPages, resolvePageSize } from '../pagination'

/**
 * usePaginationState
 *
 * 使用场景：
 * 1) 列表页（管理后台、工作台、审计日志）需要统一维护 page/pageSize/total。
 * 2) 多个页面有一致分页交互（上一页、下一页、切换每页条数）时复用。
 * 3) 避免在页面组件内重复书写边界处理逻辑（越界页码、非法 pageSize）。
 */
interface UsePaginationStateOptions {
  pageSizeOptions: number[]
  initialPage?: number
  initialPageSize?: number
  initialTotal?: number
}

export function usePaginationState(options: UsePaginationStateOptions) {
  /**
   * 分页核心状态。
   */
  const page = ref(options.initialPage ?? 1)
  const pageSize = ref(options.initialPageSize ?? options.pageSizeOptions[0] ?? 10)
  const total = ref(options.initialTotal ?? 0)

  /**
   * 派生状态：总页数、是否可翻页。
   */
  const totalPages = computed(() => getTotalPages(total.value, pageSize.value))
  const canGoPrev = computed(() => page.value > 1)
  const canGoNext = computed(() => page.value < totalPages.value)

  /**
   * 更新总数并自动校正当前页，防止当前页超过新总页数。
   */
  function setTotal(nextTotal: number) {
    total.value = Math.max(0, nextTotal)
    page.value = clampPage(page.value, totalPages.value)
  }

  /**
   * 设置页码并做边界收敛（最小 1，最大 totalPages）。
   */
  function setPage(nextPage: number) {
    page.value = clampPage(nextPage, totalPages.value)
  }

  /**
   * 修改 pageSize 并保持当前页尽量可用。
   * 适用于“不强制回第一页”的场景。
   */
  function setPageSize(nextPageSize: number) {
    pageSize.value = resolvePageSize(nextPageSize, options.pageSizeOptions, pageSize.value)
    page.value = clampPage(page.value, totalPages.value)
  }

  /**
   * 修改 pageSize 后回到第一页。
   * 适用于筛选条件变化或页面规格变化时，避免用户停留在高页码看不到数据。
   */
  function setPageSizeAndReset(nextPageSize: number) {
    pageSize.value = resolvePageSize(nextPageSize, options.pageSizeOptions, pageSize.value)
    page.value = 1
  }

  /**
   * 向前翻页，返回是否成功翻页，便于上层决定是否发起请求。
   */
  function goPrevPage() {
    if (!canGoPrev.value) {
      return false
    }

    page.value -= 1
    return true
  }

  /**
   * 向后翻页，返回是否成功翻页，便于上层决定是否发起请求。
   */
  function goNextPage() {
    if (!canGoNext.value) {
      return false
    }

    page.value += 1
    return true
  }

  return {
    page,
    pageSize,
    total,
    totalPages,
    canGoPrev,
    canGoNext,
    setTotal,
    setPage,
    setPageSize,
    setPageSizeAndReset,
    goPrevPage,
    goNextPage,
  }
}
