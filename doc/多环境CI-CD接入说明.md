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

## 3.1 自动触发（push）

- `develop` 分支：走质量门禁 + `deploy_dev`
- `test` 分支：走质量门禁 + `deploy_test`
- `stage` 分支：走质量门禁 + `deploy_stage`
- `main` 分支：走质量门禁 + `deploy_prod`
- `v*` tag：走质量门禁 + `deploy_prod`

### 3.2 PR 触发（pull_request）

- 目标分支为 `develop/test/stage/main` 时，仅执行质量门禁，不执行部署

### 3.3 手动触发（workflow_dispatch）

- 支持 `target` 选择：`dev` / `test` / `stage` / `prod` / `all`
- 手动触发会执行质量门禁与构建产物，再按目标环境执行部署 job

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

### 4.2 build_artifact

- 在 push / workflow_dispatch 事件下执行
- 重新构建并上传 `dist` 为工作流产物（artifact）

### 4.3 deploy_dev / deploy_test / deploy_stage / deploy_prod

- 按分支或手动目标触发
- 从 artifact 下载 `dist` 后执行对应部署命令
- 当前部署命令通过 GitHub Secrets 注入，未配置时会自动跳过并输出提示

---

## 5. 环境变量与 Secrets 配置

在 GitHub 仓库 `Settings -> Secrets and variables -> Actions` 中配置：

- `DEV_DEPLOY_COMMAND`
- `TEST_DEPLOY_COMMAND`
- `STAGE_DEPLOY_COMMAND`
- `PROD_DEPLOY_COMMAND`

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

### 9.2 为什么部署 job 显示跳过

通常是对应环境的 `*_DEPLOY_COMMAND` 未配置，或当前分支不匹配该环境触发条件。

### 9.3 如何一次触发所有环境

在 Actions 页面手动触发 `multi-env-ci-cd`，`target` 选择 `all`。

---

## 10. 后续演进建议

- 将部署命令从 Secrets 命令串升级为标准部署脚本
- 为 prod 增加环境审批与保护分支策略
- 接入部署后健康检查与自动回滚
- 在 CI 中补充 E2E 定时任务与失败告警
