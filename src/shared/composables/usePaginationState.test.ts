import { describe, expect, it } from 'vitest'
import { usePaginationState } from './usePaginationState'

describe('usePaginationState', () => {
  it('calculates total pages and clamps page', () => {
    const state = usePaginationState({
      pageSizeOptions: [2, 5, 10],
      initialPage: 3,
      initialPageSize: 5,
      initialTotal: 6,
    })

    expect(state.totalPages.value).toBe(2)
    expect(state.page.value).toBe(3)

    state.setTotal(6)

    expect(state.page.value).toBe(2)
    expect(state.totalPages.value).toBe(2)
  })

  it('changes page size and resets page', () => {
    const state = usePaginationState({
      pageSizeOptions: [2, 5, 10],
      initialPage: 4,
      initialPageSize: 2,
      initialTotal: 20,
    })

    state.setPageSizeAndReset(10)

    expect(state.pageSize.value).toBe(10)
    expect(state.page.value).toBe(1)
    expect(state.totalPages.value).toBe(2)
  })

  it('moves next and previous page by boundaries', () => {
    const state = usePaginationState({
      pageSizeOptions: [2, 5, 10],
      initialPage: 1,
      initialPageSize: 2,
      initialTotal: 4,
    })

    expect(state.goPrevPage()).toBe(false)
    expect(state.goNextPage()).toBe(true)
    expect(state.page.value).toBe(2)
    expect(state.goNextPage()).toBe(false)
    expect(state.goPrevPage()).toBe(true)
    expect(state.page.value).toBe(1)
  })
})
