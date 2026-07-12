# Vite 分包策略与性能预算治理

## 1. 目标

本文档用于沉淀 Phase 3 / 3.2 的分包与预算基线，方便新同学在以下场景快速对照：

- 新增依赖后评估包体影响
- 调整路由/模块后确认是否破坏拆包策略
- 发布前核对预算门禁与产物报告

## 2. 当前落地范围

- `vite.config.ts` 已配置 `build.rollupOptions.output.manualChunks`
- `src/core/router/routes.ts` 仅保留基础路由，业务路由由登录后动态注入
- 构建过程已启用预算门禁（超阈值构建直接失败）
- 构建产物默认输出包体分析报告：`dist/bundle-report.html`
- CI 已固定预算变量：`VITE_ENTRY_JS_BUDGET_KIB=300`、`VITE_ASYNC_CHUNK_BUDGET_KIB=300`、`VITE_ENABLE_MOCK=false`

## 3. 分包策略

### 3.1 第三方依赖分组

- `mock-vendor`：`msw` + `@mswjs/*`
- `framework-vue`：`vue`
- `framework-routing-state`：`vue-router` + `pinia`
- `framework-http`：`axios`
- `vendor`：其余 `node_modules` 依赖

### 3.2 业务代码分组

- 业务模块不做强制 `manualChunks` 指定，交由 Vite/Rolldown 按动态 `import()` 自动拆分
- 管理端与工作台页面通过动态路由按需加载，避免进入首屏静态链路

### 3.3 路由拆分

当前 `routes.ts` 仅保留 Home/Forbidden/NotFound 基础路由，Admin/Workspace 由 `dynamic-routes.ts` 在登录后按角色注入并懒加载。

## 4. 预算治理策略

预算通过环境变量控制（单位：KiB）：

- `VITE_ENTRY_JS_BUDGET_KIB`：入口静态依赖预算（默认 `300`）
- `VITE_ASYNC_CHUNK_BUDGET_KIB`：异步 chunk 预算（默认 `300`）
- `VITE_BUILD_PRESET`：构建预设（`development/test/stage/production/prod`）
- `VITE_CHUNK_STRATEGY`：覆盖预设的分包策略（`basic/balanced`）
- `VITE_CHUNK_WARNING_LIMIT_KIB`：覆盖预设的 chunk warning 阈值
- `VITE_ENABLE_BUNDLE_REPORT`：覆盖预设的 `bundle-report` 开关（`true/false`）

覆盖顺序（高 -> 低）：

1. 显式环境变量（如 `VITE_CHUNK_STRATEGY`、`VITE_ENABLE_BUNDLE_REPORT`）
2. `VITE_BUILD_PRESET` 指定预设
3. `mode` 默认预设（`development/test/stage/production`）
4. 未命中时回退 `production`

常见场景：

- 本地联调：`VITE_BUILD_PRESET=development`
- stage 验收：`VITE_BUILD_PRESET=stage`
- CI 生产发布：`VITE_BUILD_PRESET=prod`

预算校验规则：

- 构建阶段统计入口 chunk 及其静态依赖总和
- 逐个检查异步 chunk 体积
- 任一项超预算即构建失败

## 5. 当前基线（本地构建样本）

以下基线来自当前代码一次 `pnpm build` 输出（示例）：

- `index-*.js`：`7.87 kB`（gzip `3.55 kB`）
- `framework-routing-state-*.js`：`85.94 kB`（gzip `33.24 kB`）
- `framework-http-*.js`：`36.27 kB`（gzip `14.39 kB`）
- `vendor-*.js`：`8.41 kB`（gzip `3.72 kB`）
- `AdminView-*.js`：`3.03 kB`（gzip `1.51 kB`）
- `WorkspaceView-*.js`：`3.00 kB`（gzip `1.49 kB`）
- `mock-vendor-*.js`：`237.79 kB`（gzip `81.40 kB`，仅在开启 Mock 时按需加载）

说明：

- 文件 hash 会变化，核对时关注模块分组与数量级
- 当前入口静态依赖体积约 `138.64 KiB`，已满足 `300 KiB` 预算门禁
- 更详细依赖关系请打开 `dist/bundle-report.html`

## 6. 核对与回归流程

### 6.1 本地执行

```bash
pnpm build
```

### 6.2 CI 对齐

- 工作流：`.github/workflows/multi-env-ci-cd.yml`
- `quality` 阶段已在固定预算阈值下执行 `pnpm build`
- `quality` 阶段会上传 `dist/bundle-report.html` 作为 `bundle-report-${sha}` 产物
- CI 在构建前会解析并注入 `VITE_BUILD_PRESET`，`quality/build_artifact` 使用同一复用步骤

### 6.3 核对项

- 构建是否通过预算门禁
- `dist/bundle-report.html` 是否生成
- 关键包（`framework-routing-state`、`framework-http`、`vendor`）是否出现异常增量

### 6.4 stage 验收步骤

1. 在 Actions 中找到 `stage` 分支对应的 `multi-env-ci-cd` 运行记录
2. 确认 `quality` 阶段 `pnpm build` 成功
3. 下载 `bundle-report-${sha}` 并打开 `bundle-report.html`
4. 对照本文件第 5 节基线，核对关键 chunk 是否出现异常增量
5. 若有异常，先回溯依赖来源并给出拆分方案，再评估是否调整预算阈值

### 6.5 preset 排查建议

- `mode` 与 `VITE_BUILD_PRESET` 不一致时，以 `VITE_BUILD_PRESET` 优先
- `VITE_CHUNK_STRATEGY`、`VITE_ENABLE_BUNDLE_REPORT` 会覆盖 preset 默认值
- CI 场景先看 `Resolve build preset` 步骤，再判断是否为变量覆盖导致的结果差异
- 本地复现可直接设置 `VITE_BUILD_PRESET=stage pnpm build` 对齐 stage 行为

## 7. 调整建议

- 新增重型依赖时优先按功能路由隔离，避免并入首屏静态链路
- 公共能力优先复用现有依赖，避免重复引入同类库
- 调整预算阈值前先给出本次变更理由和对比数据，再同步更新本文件基线

## Stage 环境验收清单

### 前置条件

- [ ] CI/CD STAGE_DEPLOY_COMMAND 已配置
- [ ] Stage 环境可访问

### 验收步骤

1. **触发 stage 构建**
   - 推送到 stage 分支: `git push origin HEAD:stage`
   - 或手动触发: Actions → multi-env-ci-cd → Run workflow → target=stage

2. **检查构建产物**
   - [ ] `dist/bundle-report.html` 已上传为 artifact
   - [ ] 入口 JS 总大小 ≤ 300 KiB
   - [ ] 异步 chunk 单个 ≤ 300 KiB
   - [ ] mock-vendor 已从首屏分离

3. **运行时验证**
   - [ ] 首屏加载 LCP ≤ 2.5s（Chrome DevTools → Performance）
   - [ ] 路由切换懒加载正常
   - [ ] 分页功能（workspace/admin）正常
   - [ ] 登录/登出/权限拦截正常

4. **性能指标记录**

   | 指标           | 目标值    | 实测值 | 是否达标 |
   | -------------- | --------- | ------ | -------- |
   | 入口 JS (gzip) | ≤ 300 KiB |        |          |
   | LCP            | ≤ 2.5s    |        |          |
   | FCP            | ≤ 1.8s    |        |          |
