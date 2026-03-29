import type { LocationQueryRaw, RouteLocationNormalizedLoaded, Router } from 'vue-router'
import { parsePositiveInt, resolvePageSize } from '../pagination'

/**
 * useRoutePageQuery
 *
 * 使用场景：
 * 1) 列表分页需要与 URL query 同步，刷新页面后保持当前页与 pageSize。
 * 2) 同一页面有多个分页模块时，通过不同的 pageKey/pageSizeKey 隔离状态。
 * 3) 需要支持“分享链接即还原分页状态”的后台管理类页面。
 */
interface UseRoutePageQueryOptions {
  route: Pick<RouteLocationNormalizedLoaded, 'query'>
  router: Pick<Router, 'replace'>
  pageKey?: string
  pageSizeKey?: string
}

interface ResolveQueryPageStateOptions {
  defaultPage: number
  defaultPageSize: number
  pageSizeOptions: number[]
}

interface QueryPageState {
  page: number
  pageSize: number
}

export function useRoutePageQuery(options: UseRoutePageQueryOptions) {
  /**
   * 默认 query key，可按业务前缀覆盖，例如 adminPage / workspacePage。
   */
  const pageKey = options.pageKey ?? 'page'
  const pageSizeKey = options.pageSizeKey ?? 'pageSize'

  /**
   * 从当前路由 query 解析分页初始值。
   *
   * 使用场景：
   * - onMounted 初始化分页状态；
   * - 页面刷新后恢复用户上一次停留页。
   */
  function resolveInitialState(input: ResolveQueryPageStateOptions): QueryPageState {
    const resolvedPage = parsePositiveInt(options.route.query[pageKey], input.defaultPage)
    const resolvedPageSize = resolvePageSize(
      parsePositiveInt(options.route.query[pageSizeKey], input.defaultPageSize),
      input.pageSizeOptions,
      input.defaultPageSize,
    )
    return {
      page: resolvedPage,
      pageSize: resolvedPageSize,
    }
  }

  /**
   * 将分页状态写回 query。
   *
   * 使用场景：
   * - 翻页成功后同步 URL；
   * - 切换 pageSize 后同步 URL；
   * - 与 usePaginationState 组合形成“状态源 + URL 同步”闭环。
   */
  async function syncQuery(state: QueryPageState) {
    const nextQuery: LocationQueryRaw = {
      ...options.route.query,
      [pageKey]: String(state.page),
      [pageSizeKey]: String(state.pageSize),
    }
    await options.router.replace({
      query: nextQuery,
    })
  }

  return {
    resolveInitialState,
    syncQuery,
  }
}
