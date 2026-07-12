# E2E 测试与后续接入指南（Cypress）

## 1. 文档目标

本指南用于帮助你和后续开发者快速完成以下工作：

- 本地运行并验证现有 E2E 用例
- 基于现有骨架新增 E2E 用例
- 在日常开发与提交流程中稳定使用 E2E，降低回归风险

---

## 2. 当前 E2E 基线

### 2.1 已接入能力

- 测试框架：`cypress@15`
- 运行脚本：
  - `pnpm e2e:open`（可视化调试）
  - `pnpm e2e:run`（无头执行，适合回归/CI）
- 关键配置：
  - `baseUrl`: `http://localhost:5173`
  - `specPattern`: `cypress/e2e/**/*.cy.ts`
  - `supportFile`: `cypress/support/e2e.ts`

### 2.2 目录结构

```text
cypress/
  e2e/
    core-flow.cy.ts
  fixtures/
    roles.json
  support/
    e2e.ts
```

### 2.3 当前核心流程覆盖

当前 `core-flow.cy.ts` 已覆盖核心路径（11 条）：

- 角色登录入口可见性
- Viewer 登录 + Workspace 分页
- Admin 登录 + Admin 分页
- 未登录访问 `/workspace` 自动回首页
- Viewer 访问 `/admin` 进入 403 页面
- Logout 后重新访问受保护页再次被拦截
- Workspace 分页 query 回填
- Workspace 刷新后 query 保持
- Admin 分页 query 回填
- Admin 刷新后 query 保持
- Workspace 接口异常时错误提示

---

## 3. 快速开始（本地执行）

### 3.1 安装依赖

```bash
pnpm install
```

### 3.2 安装 Cypress 二进制（首次或缓存丢失时）

```bash
pnpm exec cypress install
```

### 3.3 启动前端应用

```bash
pnpm dev --host 0.0.0.0 --port 5173
```

### 3.4 执行 E2E

无头执行：

```bash
pnpm e2e:run
```

可视化执行：

```bash
pnpm e2e:open
```

只跑指定用例文件：

```bash
pnpm exec cypress run --e2e --browser electron --spec "cypress/e2e/core-flow.cy.ts"
```

---

## 4. 提交前推荐检查顺序

```bash
pnpm lint
pnpm typecheck
pnpm test
pnpm verify:api
pnpm e2e:run
```

说明：

- `verify:api` 会校验 `src/core/http/`、`src/mocks/` 以及 `api.test.ts` 相关 API 测试
- `e2e:run` 负责端到端用户路径回归

---

## 5. 后续接入说明（如何新增 E2E 用例）

## 5.1 新增场景时的放置规则

- 新增用例文件放在：`cypress/e2e/`
- 命名建议：`xxx-flow.cy.ts` 或 `feature-name.cy.ts`
- 仅复用 `support/e2e.ts` 的全局初始化，不在单个测试里做重复清理

### 5.2 用例设计模板

每条用例建议包含 3 段：

1. **准备**：访问页面、登录、构造 query 或 mock 条件
2. **动作**：点击、输入、翻页、刷新、跳转
3. **断言**：URL、页面关键文案、按钮状态、错误提示

### 5.3 稳定性约束（避免 flaky）

- 断言优先使用可见文本 + URL，而非脆弱样式结构
- 分页、鉴权类场景优先断言路由和 query
- 异常场景优先使用可控 mock 输入（例如约定 query 值触发 mock 分支）
- 每条用例尽量独立，可单独运行

### 5.4 异常场景接入方式（推荐）

当前已在 `src/mocks/handlers.ts` 提供可控异常分支示例（如 Workspace `page=500` 返回 500）。  
后续新增异常测试时，优先按同样模式扩展 mock handler，使错误场景可重复、可定位。

### 5.5 新增鉴权路径时的同步要求

如果新增页面需要登录或角色权限，务必同步设置路由 `meta`：

- `requiresAuth`
- `roles`
- `permissions`

否则守卫行为和 E2E 断言会不一致。

---

## 6. 常见问题排查

### 6.1 提示 Cypress executable not found

执行：

```bash
pnpm exec cypress install
```

### 6.2 E2E 报页面无法访问

检查：

- 前端 dev server 是否已启动在 `5173`
- `cypress.config.ts` 的 `baseUrl` 是否匹配

### 6.3 单条用例本地偶发失败

排查顺序：

1. 先单跑该 spec
2. 使用 `pnpm e2e:open` 观察真实交互链路
3. 检查该场景是否依赖非稳定数据或共享状态

---

## 7. 维护建议

- 每次新增关键业务路径，至少补 1 条 E2E（成功路径或失败路径）
- 每次改动路由守卫、登录流程、分页参数时，必须更新对应 E2E
- 保持 E2E 用例语义化命名，保证失败信息可直接定位业务流程
