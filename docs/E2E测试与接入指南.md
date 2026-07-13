# E2E 测试与接入指南（Playwright）

## 1. 文档目标

本指南用于帮助你和后续开发者快速完成以下工作：

- 本地运行并验证现有 E2E 用例
- 基于现有骨架新增 E2E 用例
- 在日常开发与提交流程中稳定使用 E2E，降低回归风险

---

## 2. 当前 E2E 基线

### 2.1 已接入能力

- 测试框架：`@playwright/test`
- 浏览器：Chromium + Mobile Chrome
- 运行脚本：
  - `pnpm e2e`（无头执行，适合回归/CI）
  - `pnpm e2e:ui`（交互式调试）
- 关键配置：
  - `playwright.config.ts`

### 2.2 目录结构

```text
e2e/
  core-flow.spec.ts        # 核心认证与导航流程
  system-user.spec.ts      # 用户管理 CRUD 黄金路径（按需）
```

### 2.3 当前核心流程覆盖

`core-flow.spec.ts` 覆盖以下路径：

- 登录页表单可见性
- Viewer 登录后跳转 Dashboard
- Admin 登录后跳转 Dashboard
- 未登录访问 `/workspace` 重定向到登录页
- Viewer 访问 `/admin` 进入 404 页面
- 登出后重定向到登录页

---

## 3. 快速开始（本地执行）

### 3.1 安装依赖

```bash
pnpm install
```

### 3.2 安装 Playwright 浏览器（首次或缓存丢失时）

```bash
pnpm exec playwright install
```

### 3.3 启动前端应用

```bash
pnpm dev
```

### 3.4 执行 E2E

无头执行（全部）：

```bash
pnpm e2e
```

交互式调试：

```bash
pnpm e2e:ui
```

只跑指定用例文件：

```bash
pnpm e2e -- e2e/core-flow.spec.ts
```

---

## 4. 提交前推荐检查顺序

```bash
pnpm lint
pnpm format:check
pnpm typecheck
pnpm test
pnpm verify:api
pnpm build
pnpm e2e
```

说明：

- `verify:api` 会校验 `src/core/http/`、`src/mocks/` 以及 `api.test.ts` 相关 API 测试
- `e2e` 负责端到端用户路径回归
- CI 使用生产构建产物运行 E2E

---

## 5. 后续接入说明（如何新增 E2E 用例）

### 5.1 新增场景时的放置规则

- 新增用例文件放在：`e2e/`
- 命名建议：`<module>.spec.ts` 或 `<feature>-flow.spec.ts`
- 使用 Playwright 的 `test.describe` 组织测试组

### 5.2 用例设计模板

每条用例建议包含 3 段：

1. **准备**：访问页面、登录、构造 query 或 mock 条件
2. **动作**：点击、输入、翻页、刷新、跳转
3. **断言**：URL、页面关键文案、按钮状态、错误提示

### 5.3 定位器最佳实践

优先使用可访问角色定位器，避免依赖 CSS 类名：

```ts
// 推荐
await page.getByRole('button', { name: '登录' }).click()
await page.getByText('用户名', { exact: true }).isVisible()
await page.getByLabel('名称').fill('测试')

// Naive UI 特殊处理
await page.locator('.n-select').click()
await page.locator('.n-base-select-option__content', { hasText: '管理员' }).click()

// 避免
await page.locator('.login-btn').click() // 脆弱，类名可能变化
```

### 5.4 稳定性约束（避免 flaky）

- 断言优先使用可见文本 + URL，而非脆弱样式结构
- 分页、鉴权类场景优先断言路由和 query
- 异常场景使用 `page.route()` 拦截 API 请求
- 每条用例尽量独立，可单独运行
- 使用 `page.waitForURL()` 等待导航完成

### 5.5 异常场景接入方式

使用 Playwright 的 `page.route()` 拦截 API 请求：

```ts
test('handles API error gracefully', async ({ page }) => {
  await page.route('**/api/system/users*', (route) =>
    route.fulfill({
      status: 500,
      body: JSON.stringify({ code: 500, message: 'Internal Error' }),
    }),
  )
  await page.goto('/system/user')
  await expect(page.getByText('加载失败')).toBeVisible()
})
```

### 5.6 新增鉴权路径时的同步要求

如果新增页面需要登录或角色权限，务必同步设置路由 `meta`：

- `requiresAuth`
- `roles`
- `permissions`

否则守卫行为和 E2E 断言会不一致。

---

## 6. 常见问题排查

### 6.1 提示浏览器未安装

执行：

```bash
pnpm exec playwright install
```

### 6.2 E2E 报页面无法访问

检查：

- 前端 dev server 是否已启动
- `playwright.config.ts` 的 `baseURL` 是否匹配

### 6.3 单条用例本地偶发失败

排查顺序：

1. 先单跑该 spec：`pnpm e2e -- e2e/<name>.spec.ts`
2. 使用 `pnpm e2e:ui` 观察真实交互链路
3. 检查该场景是否依赖非稳定数据或共享状态

### 6.4 CI 中 E2E 失败但本地通过

- CI 使用生产构建，本地 dev 模式可能有差异
- 检查 CI artifact 中的 trace、video 和 screenshot
- 确认 Mock handler 在生产模式下正确配置

---

## 7. 维护建议

- 每次新增关键业务路径，至少补 1 条 E2E（成功路径或失败路径）
- 每次改动路由守卫、登录流程、分页参数时，必须更新对应 E2E
- 保持 E2E 用例语义化命名，保证失败信息可直接定位业务流程
- CI 失败时上传 trace、video、screenshot 和 HTML report 供排查
