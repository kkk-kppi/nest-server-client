# ADR-0004: 分页 Composables 复用模式

## 状态

已采纳

## 背景

多个页面（Admin、Workspace）需要相同的分页逻辑：异步加载、页码管理、URL 同步。

## 决策

采用三件套 composables：

- `useAsyncState<T>` — 通用异步状态（data/loading/error + stale-task 保护）
- `usePaginationState` — 分页状态（page/pageSize/total + 边界钳位）
- `useRoutePageQuery` — URL query 双向同步（支持自定义 key 隔离）

## 后果

- 新增分页页面只需组合三个 composable
- URL query key 需按页面命名隔离（如 `adminPage` vs `workspacePage`）
- 所有分页边界逻辑集中在 shared 层，业务页面零重复代码
