# API MOCK 指南和接入说明

## 一键验证脚本当前覆盖范围

- 当前脚本：`pnpm verify:api`
- 执行内容：
  - `pnpm typecheck`
  - `pnpm exec vitest run src/core/http/ src/mocks/ api.test.ts`
- 结论：该脚本可以稳定校验 API 请求封装层与类型推导基础能力，并自动收集约定目录下的新增 API/Mock 测试。

## 后续新增 Mock API 是否会被自动校验

- 会自动收集以下目录下的测试文件：
  - `src/core/http/` 目录下全部测试文件
  - `src/mocks/` 目录下全部测试文件
  - 文件名包含 `api.test.ts` 的测试文件
- 仍需注意：脚本只会执行“已经存在的测试文件”，不会自动生成测试代码。

## 新增 API Mock 的手动接入步骤

1. 在业务 API 文件中新增 endpoint 声明与调用函数（`src/features/*/api.ts`）。
2. 在 `src/mocks/handlers.ts` 增加对应 `http.get/http.post/...` 处理逻辑。
3. 保持 Mock 路径与 endpoint 路径一致，建议继续使用 `resolveMockPath(endpoint.path)`。
4. 为新增接口补充测试文件（建议放在：
   - `src/mocks/*.test.ts` 或
   - `src/features/**/api.test.ts`）。
5. 按命名规范创建测试文件后，直接执行 `pnpm verify:api` 验证。

## 推荐的 verify:api 扩展方式

- 如果你希望后续新增测试自动被脚本识别，可将 `verify:api` 改成包含模式匹配的形式。
- 示例：

```json
"verify:api": "pnpm typecheck && pnpm exec vitest run src/core/http/ src/mocks/ api.test.ts"
```

- 采用该方式后，后续只要测试文件命名和目录符合约定，就能被一键脚本自动执行。

## 本地验证清单

- 开发环境开启 Mock：`VITE_ENABLE_MOCK=true`（`.env.development`）
- 启动项目：`pnpm dev`
- 执行一键校验：`pnpm verify:api`
- 变更后建议补充执行：`pnpm lint`
