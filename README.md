# nest-server-client

一个基于 **Vue 3 + TypeScript + Vite** 的前端单页应用示例项目。  
当前代码库已实现分层架构（`app/core/features/shared`）、鉴权路由、HTTP 中台与单元测试门禁，可作为业务前端工程化基线。

## 快速开始

```bash
pnpm install          # 安装依赖
pnpm dev              # 启动开发服务器（Vite HMR）
pnpm build            # 类型检查 + 生产构建（输出到 dist/）
pnpm test             # 运行单元测试（Vitest）
pnpm e2e              # 运行 Playwright E2E 测试
pnpm e2e:ui           # 打开 Playwright 交互式调试
```

## 环境变量

| 变量                | 默认值                  | 说明                                             |
| ------------------- | ----------------------- | ------------------------------------------------ |
| `VITE_API_BASE_URL` | `http://localhost:3000` | 后端 API 基础地址                                |
| `VITE_ENABLE_MOCK`  | `false`                 | 启用 MSW 浏览器端 Mock                           |
| `VITE_SENTRY_DSN`   | -                       | Sentry 错误上报 DSN                              |
| `VITE_BUILD_PRESET` | auto                    | 构建预设：development/test/stage/production/prod |

## 项目结构

```text
src/
├── app/           # 组装层：bootstrap、布局、根组件
├── core/          # 基础设施层：HTTP、路由、Store、配置
├── features/      # 业务域模块：auth、admin、workspace、system
├── shared/        # 跨域共享：composables、原子组件、工具函数
└── mocks/         # MSW 浏览器端 Mock（handlers、worker）
```

## 文档

- [企业级前端架构路线图](./docs/企业级前端架构路线图.md)
- [Docker 部署与运行指南](./docs/Docker部署与运行指南.md)
- [Vite 分包策略与性能预算治理](./docs/Vite分包策略与性能预算治理.md)
- [API MOCK 指南和接入说明](./docs/API%20MOCK指南和接入说明.md)
- [E2E 测试与接入指南](./docs/E2E测试与接入指南.md)
- [业务模块接入指南](./docs/业务模块接入指南.md)
- [环境变量提交规范](./docs/环境变量提交规范.md)
- [分支规范文档](./docs/分支规范文档.md)
- [多环境 CI-CD 接入说明](./docs/多环境CI-CD接入说明.md)
- [ADR 架构决策记录](./docs/adr/)

## 常用命令

| 命令                   | 说明                    |
| ---------------------- | ----------------------- |
| `pnpm lint`            | ESLint + Stylelint 检查 |
| `pnpm lint:fix`        | 自动修复 lint 问题      |
| `pnpm typecheck`       | TypeScript 类型检查     |
| `pnpm format`          | Prettier 格式化         |
| `pnpm format:check`    | Prettier 只读检查（CI） |
| `pnpm test`            | 单元测试（Vitest）      |
| `pnpm test:coverage`   | 单元测试 + 覆盖率报告   |
| `pnpm verify:api`      | typecheck + API 层单测  |
| `pnpm e2e`             | Playwright E2E 测试     |
| `pnpm e2e:ui`          | Playwright 交互式调试   |
| `pnpm storybook`       | 启动 Storybook 组件文档 |
| `pnpm build-storybook` | 构建 Storybook 静态站点 |

## 技术栈

- **框架**：Vue 3 + TypeScript
- **构建**：Vite 8
- **路由**：Vue Router 4
- **状态**：Pinia + persistedstate
- **请求**：Axios
- **测试**：Vitest + Vue Test Utils + Playwright
- **组件文档**：Storybook

## 许可证

当前仓库未包含许可证文件。如需开源发布，建议补充 `LICENSE` 文件。
