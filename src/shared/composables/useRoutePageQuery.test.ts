import type { RouteLocationNormalizedLoaded, Router } from 'vue-router'
import { describe, expect, it, vi } from 'vitest'
import { useRoutePageQuery } from './useRoutePageQuery'

describe('useRoutePageQuery', () => {
  it('resolves initial query state with keys', () => {
    const route = {
      query: {
        workspacePage: '3',
        workspacePageSize: '5',
      },
    }
    const router = {
      replace: vi.fn(),
    }
    const query = useRoutePageQuery({
      route: route as Pick<RouteLocationNormalizedLoaded, 'query'>,
      router: router as unknown as Pick<Router, 'replace'>,
      pageKey: 'workspacePage',
      pageSizeKey: 'workspacePageSize',
    })

    const state = query.resolveInitialState({
      defaultPage: 1,
      defaultPageSize: 2,
      pageSizeOptions: [2, 5, 10],
    })

    expect(state).toEqual({
      page: 3,
      pageSize: 5,
    })
  })

  it('syncs route query with target page state', async () => {
    const route = {
      query: {
        keyword: 'abc',
      },
    }
    const router = {
      replace: vi.fn().mockResolvedValue(undefined),
    }
    const query = useRoutePageQuery({
      route: route as Pick<RouteLocationNormalizedLoaded, 'query'>,
      router: router as unknown as Pick<Router, 'replace'>,
      pageKey: 'adminPage',
      pageSizeKey: 'adminPageSize',
    })

    await query.syncQuery({
      page: 2,
      pageSize: 10,
    })

    expect(router.replace).toHaveBeenCalledWith({
      query: {
        keyword: 'abc',
        adminPage: '2',
        adminPageSize: '10',
      },
    })
  })
})
