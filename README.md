# nest-server-client

一个基于 **Vue 3 + TypeScript + Vite** 的前端单页应用示例项目。  
当前代码库已实现分层架构（`app/core/features/shared`）、鉴权路由、HTTP 中台与单元测试门禁，可作为业务前端工程化基线。

## 项目简介

本项目采用 Vue 3 单文件组件（SFC）与 `<script setup lang="ts">` 编写方式，使用 Vite 进行本地开发与生产构建。

应用入口由 `src/main.ts` 调用 `src/app/bootstrap.ts`，挂载 `src/app/AppRoot.vue`，并通过 `vue-router + pinia` 组装业务页面。

## 技术栈与架构

- **框架**：Vue 3 (`vue`)
- **语言**：TypeScript
- **构建工具**：Vite 8 (`vite`)
- **路由管理**：Vue Router 4 (`vue-router`)
- **状态管理**：Pinia + persistedstate (`pinia` / `pinia-plugin-persistedstate`)
- **请求层**：Axios (`axios`)
- **Vue 构建插件**：`@vitejs/plugin-vue`
- **类型检查**：`vue-tsc`
- **测试框架**：Vitest + Vue Test Utils
- **TS 配置基线**：`@vue/tsconfig`

架构特征：

- **前端纯静态 SPA**：无后端服务代码、无服务端渲染配置
- **分层目录**：`app` 负责装配，`core` 提供基础能力，`features` 承载业务域，`shared` 提供跨域复用
- **权限与路由**：支持基于角色/权限的动态路由与守卫拦截
- **HTTP 中台**：统一请求封装、鉴权头注入、401 处理与错误归一
- **副作用治理**：沉淀 `useAsyncState/usePaginationState/useRoutePageQuery` 复用模式
- **资源管理**：图片资源位于 `src/assets`，图标资源位于 `public`
- **样式组织**：全局样式集中在 `src/style.css`

## 功能特性

- 分层前端架构（`app/core/features/shared`）
- Vite 开发服务器（支持 HMR 热更新）
- RBAC 权限路由与动态菜单路由注册
- Axios 请求中台与统一错误处理
- API endpoint 声明 + 请求/响应类型自动推导（`InferEndpointRequest/InferEndpointResponse`）
- Workspace/Admin 页面分页与查询参数联动
- composables 约定与副作用治理（loading/error/data、分页状态、query 同步）
- MSW 浏览器端 Mock（通过 `VITE_ENABLE_MOCK` 开关启用）
- Vitest + Vue Test Utils 单测体系（覆盖率门禁）
- 深浅色主题适配（基于 `prefers-color-scheme`）
- 生产构建与静态预览能力

## 系统要求与依赖

### 运行环境

- Node.js（仓库未声明固定版本，需可正常运行 Vite 8 与 Vue 3 工具链）
- 包管理器：`pnpm`（仓库包含 `pnpm-lock.yaml`），也可使用 `npm`

### 项目依赖

运行时依赖：

- `vue`
- `vue-router`
- `pinia`
- `pinia-plugin-persistedstate`
- `axios`

开发依赖：

- `vite`
- `@vitejs/plugin-vue`
- `typescript`
- `vue-tsc`
- `@vue/tsconfig`
- `@types/node`

## 安装与配置指南

### 1) 克隆项目

```bash
git clone <your-repo-url>
cd nest-server-client
```

### 2) 安装依赖

推荐使用 pnpm：

```bash
pnpm install
```

可选（npm）：

```bash
npm install
```

### 3) 启动开发环境

```bash
pnpm dev
```

启动后默认可在本地 Vite 地址访问页面。

### 4) 类型检查并构建生产版本

```bash
pnpm build
```

该命令会先执行 `vue-tsc -b`，随后执行 `vite build`，产物输出到 `dist/`。

### 5) 本地预览构建产物

```bash
pnpm preview
```

## 使用示例

### 组件组合示例（`src/App.vue`）

```vue
<script setup lang="ts">
import HelloWorld from './components/HelloWorld.vue'
</script>

<template>
  <HelloWorld />
</template>
```

### 响应式状态示例（`src/components/HelloWorld.vue`）

```vue
<script setup lang="ts">
import { ref } from 'vue'

const count = ref(0)
</script>

<template>
  <button class="counter" @click="count++">Count is {{ count }}</button>
</template>
```

## API 接口文档

当前仓库已实现前端 API 调用层与请求中台：

- `src/core/http`：Axios 实例、请求封装、拦截器、错误类型
- `src/features/*/api.ts`：按业务域组织接口（auth/workspace/admin）
- `src/mocks/*`：MSW handlers 与 worker 启动入口（按环境变量开关）

当前仓库未接入 OpenAPI/Swagger 自动生成，但已通过 endpoint 声明实现请求/响应类型自动推导。

### NestJS 对接约定模板（建议）

以下内容为当前联调约定模板，用于继续统一前后端契约。

#### 1) Base URL 与环境变量

建议在前端通过 Vite 环境变量管理后端地址：

```bash
VITE_API_BASE_URL=http://localhost:3000
VITE_ENABLE_MOCK=true
```

建议封装访问入口（示例）：

```ts
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL
```

#### 2) 推荐响应结构

建议与 NestJS 统一为如下返回体：

```json
{
  "code": 0,
  "message": "ok",
  "data": {}
}
```

字段语义建议：

- `code`：业务状态码，`0` 表示成功
- `message`：可读提示信息
- `data`：业务数据载荷

#### 3) 认证与请求头约定

- 建议采用 `Authorization: Bearer <token>` 作为鉴权头
- 建议在前端统一拦截 `401` 并跳转登录态恢复流程
- 建议所有写操作携带 `Content-Type: application/json`

#### 4) 前端接口文件组织建议

```text
src/
├─ core/
│  └─ http/
│     ├─ client.ts        # axios 实例
│     ├─ endpoint.ts      # endpoint 声明与类型推导
│     ├─ interceptors.ts  # 鉴权与异常处理
│     ├─ request.ts       # get/post/put/patch/delete 封装
│     └─ types.ts         # 通用请求/响应类型
├─ mocks/
│  ├─ browser.ts          # MSW worker 启动
│  └─ handlers.ts         # 接口 mock handlers
└─ features/
   ├─ auth/api.ts
   ├─ workspace/api.ts
   └─ admin/api.ts
```

#### 5) TypeScript 类型示例

```ts
import {
  definePostEndpoint,
  type InferEndpointRequest,
  type InferEndpointResponse,
} from '@/core/http'

const loginByRoleEndpoint = definePostEndpoint<
  '/api/auth/login-by-role',
  { accessToken: string; roles: string[]; permissions: string[] },
  { role: 'admin' | 'editor' | 'viewer' }
>('/api/auth/login-by-role')

type LoginPayload = InferEndpointRequest<typeof loginByRoleEndpoint>
type LoginResult = InferEndpointResponse<typeof loginByRoleEndpoint>
```

## 项目结构

```text
nest-server-client/
├─ .vscode/
│  ├─ extensions.json
│  └─ settings.json
├─ doc/
│  ├─ 企业级前端架构路线图.md
│  ├─ 分支规范文档.md
│  └─ 环境变量提交规范.md
├─ public/
│  ├─ favicon.svg
│  ├─ icons.svg
│  └─ mockServiceWorker.js
├─ src/
│  ├─ assets/
│  │  ├─ hero.png
│  │  ├─ vite.svg
│  │  └─ vue.svg
│  ├─ app/
│  │  ├─ layouts/
│  │  │  └─ AppPageLayout.vue
│  │  ├─ views/
│  │  │  ├─ ForbiddenView.vue
│  │  │  └─ NotFoundView.vue
│  │  ├─ AppRoot.vue
│  │  └─ bootstrap.ts
│  ├─ core/
│  │  ├─ config/
│  │  │  └─ env.ts
│  │  ├─ http/
│  │  │  ├─ client.ts
│  │  │  ├─ endpoint.ts
│  │  │  ├─ index.ts
│  │  │  ├─ interceptors.ts
│  │  │  ├─ request.ts
│  │  │  └─ types.ts
│  ├─ mocks/
│  │  ├─ browser.ts
│  │  └─ handlers.ts
│  │  ├─ router/
│  │  │  ├─ dynamic.ts
│  │  │  ├─ guards.ts
│  │  │  ├─ index.ts
│  │  │  └─ routes.ts
│  │  ├─ store/
│  │  │  └─ index.ts
│  │  └─ index.ts
│  ├─ features/
│  │  ├─ admin/
│  │  │  ├─ api.ts
│  │  │  └─ views/AdminView.vue
│  │  ├─ auth/
│  │  │  ├─ store/useAuthStore.ts
│  │  │  ├─ api.ts
│  │  │  ├─ dynamic-routes.ts
│  │  │  └─ permission.ts
│  │  ├─ home/
│  │  │  ├─ components/HomeHeroPanel.vue
│  │  │  └─ views/HomeView.vue
│  │  ├─ workspace/
│  │  │  ├─ api.ts
│  │  │  └─ views/WorkspaceView.vue
│  │  └─ index.ts
│  ├─ shared/
│  │  ├─ composables/
│  │  │  ├─ useAsyncState.ts
│  │  │  ├─ usePaginationState.ts
│  │  │  └─ useRoutePageQuery.ts
│  │  ├─ components/
│  │  │  └─ atoms/CounterButton.vue
│  │  ├─ index.ts
│  │  └─ pagination.ts
│  ├─ components/
│  │  └─ HelloWorld.vue
│  ├─ App.vue
│  ├─ main.ts
│  └─ style.css
├─ scripts/
│  └─ validate-branch-name.mjs
├─ .env.example
├─ .gitignore
├─ commitlint.config.cjs
├─ index.html
├─ lint-staged.config.mjs
├─ package.json
├─ pnpm-lock.yaml
├─ README.md
├─ tsconfig.app.json
├─ tsconfig.json
├─ tsconfig.node.json
├─ vitest.config.ts
└─ vite.config.ts
```

## 可用脚本

- `pnpm dev`：启动开发服务器
- `pnpm typecheck`：执行 TypeScript 类型检查
- `pnpm lint`：执行 ESLint + Stylelint
- `pnpm lint:fix`：自动修复可修复的 lint 问题
- `pnpm format`：执行 Prettier 格式化
- `pnpm test`：运行单元测试
- `pnpm test:coverage`：运行单元测试并输出覆盖率报告
- `pnpm verify:api`：一键验证 API 改动（`typecheck` + API 请求层单测）
- `pnpm build`：执行类型检查并构建生产包
- `pnpm preview`：预览构建产物

## 贡献规范

欢迎贡献代码，建议遵循以下流程：

1. Fork 并创建功能分支
2. 保持 TypeScript 严格模式下无类型错误
3. 本地执行 `pnpm lint`、`pnpm typecheck`、`pnpm test:coverage`
4. 如变更涉及架构/流程/目录，需同步更新 README 与 `doc/企业级前端架构路线图.md`
5. 提交清晰的变更说明并发起 Pull Request

开发建议：

- 遵循现有 SFC 与 `<script setup>` 风格
- 优先保证组件职责单一、命名清晰
- 新增业务能力时同步补充 README 对应章节

## 作者信息

- 名称：`lazason`
- 邮箱：`lazason@foxmail.com`

## 许可证

当前仓库未包含许可证文件，且 `package.json` 未声明 `license` 字段。  
如需开源发布，建议补充 `LICENSE` 文件并在 `package.json` 中明确许可证类型。
