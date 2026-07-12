# 多环境 CI/CD 接入说明（Phase 3 / 3.2 初版）

## 1. 目标

本方案用于在仓库内落地一套可直接运行的多环境流水线，覆盖：

- 统一质量门禁：install → lint → typecheck → test → verify:api → build
- 四环境发布入口：dev / test / stage / prod
- 分支触发与手动触发并存，支持快速回归与手动补发

---

## 2. 已落地文件

- 工作流配置：`.github/workflows/multi-env-ci-cd.yml`

该配置采用 GitHub Actions，默认 Node 22 与 pnpm 10。

---

## 3. 触发策略

### 3.1 自动触发（push）

- `develop` 分支：走质量门禁 + `deploy_dev`
- `test` 分支：走质量门禁 + `deploy_test`
- `stage` 分支：走质量门禁 + `deploy_stage`
- `main` 分支：走质量门禁 + `deploy_prod`
- `v*` tag：走质量门禁 + `deploy_prod`

### 3.2 PR 触发（pull_request）

- 目标分支为 `develop/test/stage/main` 时，仅执行质量门禁，不执行部署

### 3.3 手动触发（workflow_dispatch）

- 支持 `action` 选择：`deploy` / `rollback`
- 支持 `target` 选择：`dev` / `test` / `stage` / `prod` / `all`
- 支持 `dry_run`：`true/false`（默认 `true`）
- `action=deploy`：执行质量门禁与构建产物，再按目标环境执行部署 job
- `action=rollback`：执行指定环境回滚 job（需选择单环境 target，且可传 `rollback_version`）
- `dry_run=true`：仅验收流水线链路，不执行真实部署/回滚命令

---

## 4. 流水线阶段说明

### 4.1 quality

执行顺序：

1. `pnpm install --frozen-lockfile`
2. `pnpm lint`
3. `pnpm typecheck`
4. `pnpm test`
5. `pnpm verify:api`
6. `pnpm build`

任一阶段失败即阻断后续构建与部署。

预算对齐策略：

- 固定 `VITE_ENABLE_MOCK=false`
- 固定 `VITE_ENTRY_JS_BUDGET_KIB=300`
- 固定 `VITE_ASYNC_CHUNK_BUDGET_KIB=300`
- 构建前统一解析并注入 `VITE_BUILD_PRESET`
  - `develop -> development`
  - `test -> test`
  - `stage -> stage`
  - `main/tag(v*) -> prod`
  - `workflow_dispatch` 场景按 `target` 解析（`dev/test/stage/prod`）
- `pnpm build` 失败即视为性能预算门禁未通过
- `Resolve build preset` 步骤已在 `quality` 与 `build_artifact` 间复用，避免多处脚本漂移

`VITE_BUILD_PRESET` 解析优先级：

1. `workflow_dispatch(action=deploy)`：优先按 `target` 映射
2. `pull_request`：按 `base_ref`（目标分支）映射
3. `push/tag`：按当前 `ref` 映射
4. 未命中映射时回退 `production`

映射结果只用于设置构建预设，预算阈值仍由固定变量 `VITE_ENTRY_JS_BUDGET_KIB` 与 `VITE_ASYNC_CHUNK_BUDGET_KIB` 约束。

### 4.2 build_artifact

- 在 push / workflow_dispatch 事件下执行
- 重新构建并上传 `dist` 为工作流产物（artifact）
- `quality` 阶段额外上传 `dist/bundle-report.html` 为 `bundle-report-${sha}`，用于分包回归对照

### 4.3 deploy_dev / deploy_test / deploy_stage / deploy_prod

- 按分支或手动目标触发
- 从 artifact 下载 `dist` 后执行对应部署命令
- `workflow_dispatch` 且 `dry_run=true` 时，仅输出模拟执行日志并跳过命令
- 部署命令通过 GitHub Secrets 注入，未配置会直接失败并阻断发布

### 4.4 rollback

- 仅在 `workflow_dispatch` 且 `action=rollback` 时触发
- 根据 `target` 选择执行对应环境回滚命令
- 可通过 `rollback_version` 传入回滚版本（供回滚命令读取）
- `dry_run=true` 时仅验证路由与参数，不执行真实回滚命令

---

## 5. 环境变量与 Secrets 配置

在 GitHub 仓库 `Settings -> Secrets and variables -> Actions` 中配置：

- `DEV_DEPLOY_COMMAND`
- `TEST_DEPLOY_COMMAND`
- `STAGE_DEPLOY_COMMAND`
- `PROD_DEPLOY_COMMAND`
- `DEV_ROLLBACK_COMMAND`
- `TEST_ROLLBACK_COMMAND`
- `STAGE_ROLLBACK_COMMAND`
- `PROD_ROLLBACK_COMMAND`

建议命令格式为单行可执行 shell 命令，例如：

```bash
rsync -avz dist/ user@host:/var/www/app/
```

或：

```bash
aws s3 sync dist/ s3://your-bucket --delete
```

---

## 6. GitHub Environments 建议

建议在仓库 `Settings -> Environments` 中创建：

- `dev`
- `test`
- `stage`
- `prod`

并按环境配置：

- 必要审批人（尤其 prod）
- 环境级 secrets
- 部署保护规则

---

## 7. 分支发布建议

- 功能开发：`feature/*` -> 合并到 `develop`（自动发布 dev）
- 提测分支：`develop` -> `test`（自动发布 test）
- 预发分支：`test` -> `stage`（自动发布 stage）
- 生产发布：`stage` -> `main` 或打 `v*` tag（自动发布 prod）

---

## 8. 本地与 CI 对齐建议

提交前建议本地先执行：

```bash
pnpm lint
pnpm typecheck
pnpm test
pnpm verify:api
pnpm build
```

这组命令与流水线质量门禁保持一致，可显著减少 CI 失败率。

---

## 9. 常见问题

### 9.1 为什么 PR 不会部署

PR 仅做质量验证，避免预览分支误发版。部署仅在 push 到环境分支或手动触发时执行。

### 9.2 为什么部署 job 失败

通常是对应环境的 `*_DEPLOY_COMMAND` 未配置，或命令本身执行失败。当前策略会直接失败并阻断发布。

### 9.3 如何一次触发所有环境

在 Actions 页面手动触发 `multi-env-ci-cd`，`target` 选择 `all`。

### 9.4 如何手动触发回滚

在 Actions 页面手动触发 `multi-env-ci-cd`，设置：

- `action=rollback`
- `target=dev|test|stage|prod`（不支持 all）
- `rollback_version`（按你的回滚脚本约定填写）
- `dry_run`：验收链路用 `true`，真实回滚用 `false`

### 9.5 如何做 CI/CD 验收闭环（不触发真实发布）

在 Actions 页面手动触发 `multi-env-ci-cd`：

1. 选择 `action=deploy`
2. `target=all`
3. `dry_run=true`
4. 观察 `quality -> build_artifact -> deploy_*` 全链路为成功
5. 校验日志包含 `Dry run enabled`，确认未执行真实部署命令

### 9.6 如何排查 `VITE_BUILD_PRESET` 与预期不一致

按以下顺序定位：

1. 确认触发类型（`workflow_dispatch` / `pull_request` / `push`）
2. 在工作流日志查看 `Resolve build preset` 步骤输出，确认最终写入的 `VITE_BUILD_PRESET`
3. 若是 `workflow_dispatch(action=deploy)`，优先核对 `target` 值
4. 若是 `pull_request`，核对 `base_ref` 是否为 `develop/test/stage/main`
5. 若是 `push/tag`，核对 `ref` 是否命中 `develop/test/stage/main/v*`
6. 仍不符合预期时，按回退规则视为 `production`，并在 PR 说明中标注原因

---

## 10. 后续演进建议

- 将部署命令从 Secrets 命令串升级为标准部署脚本
- 为 prod 增加环境审批与保护分支策略
- 接入部署后健康检查与自动回滚
- 在 CI 中补充 E2E 定时任务与失败告警

---

## 11. stage 验收操作清单（性能预算）

适用场景：`stage` 分支 push 后，确认本次发布满足分包与预算门禁。

1. 打开 GitHub Actions，进入对应的 `multi-env-ci-cd` 工作流运行记录。
2. 确认 `quality` job 成功，且 `pnpm build` 未触发预算错误。
3. 在 Artifacts 区域下载 `bundle-report-${sha}`。
4. 解压后打开 `bundle-report.html`，核对入口静态链路体积是否仍在预算线内。
5. 对照基线重点关注 `framework-routing-state`、`framework-http`、`vendor` 是否出现异常增量。
6. 如出现异常增量，先在 PR 记录依赖来源与拆分方案，再决定是否调整预算阈值。

---

## 12. 环境命令 Secrets 配置

在 GitHub 仓库 Settings → Secrets and variables → Actions 中配置以下 Secrets：

| Secret 名称              | 所属环境 | 用途             |
| ------------------------ | -------- | ---------------- |
| `DEV_DEPLOY_COMMAND`     | dev      | 开发环境部署命令 |
| `DEV_ROLLBACK_COMMAND`   | dev      | 开发环境回滚命令 |
| `TEST_DEPLOY_COMMAND`    | test     | 测试环境部署命令 |
| `TEST_ROLLBACK_COMMAND`  | test     | 测试环境回滚命令 |
| `STAGE_DEPLOY_COMMAND`   | stage    | 预发环境部署命令 |
| `STAGE_ROLLBACK_COMMAND` | stage    | 预发环境回滚命令 |
| `PROD_DEPLOY_COMMAND`    | prod     | 生产环境部署命令 |
| `PROD_ROLLBACK_COMMAND`  | prod     | 生产环境回滚命令 |

### 验证方式

使用 `workflow_dispatch` + `dry_run=true` 验证流水线链路：

1. 进入 Actions → multi-env-ci-cd → Run workflow
2. 选择 action=deploy, target=all, dry_run=true
3. 观察 quality → build*artifact → deploy*\* 全链路通过
