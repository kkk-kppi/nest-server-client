# 通用后台管理底座设计规格

> **项目**: nest-server-client 企业级管理系统底座
> **分支**: feature/admin-scaffold
> **技术栈**: Vue 3 + TypeScript + Vite + Naive UI

## 1. 概述

在现有 Vue 3 + TS + Vite SPA 架构基础上，集成 Naive UI 组件库，搭建通用后台管理系统的底座层。产出是一个可复用的管理系统脚手架，业务团队拿到即可直接开发业务页面。

### 包含范围

- Naive UI 集成与主题定制
- 管理后台布局（侧边栏/顶栏/面包屑/多标签页）
- 布局模式切换（侧边菜单/顶部菜单/混合菜单）
- 亮色/暗色主题切换
- 图标系统集成
- 登录页重构（Naive UI 表单）
- 路由 → 菜单自动转换
- 权限管理页面（用户/角色/字典 CRUD）
- 通用增强组件（ProTable/ProForm/SearchBar/DictTag）
- 数据字典模块
- 国际化（中/英双语）

### 不包含范围

- 具体业务模块
- 富文本编辑器
- 文件上传 + OSS
- 数据可视化（ECharts）
- WebSocket 实时通知
- 微前端接入

## 2. 目录结构变更

```
新增:
  src/core/i18n/                  # vue-i18n 初始化 + 语言包
  src/core/theme/                 # Naive UI 主题配置 + useTheme + useLayoutSetting
  src/app/layouts/AdminLayout.vue # 管理后台主布局
  src/app/layouts/components/     # AdminSidebar/Topbar/Breadcrumb/Tabs/UserMenu/SettingPanel
  src/app/layouts/composables/    # useMenuRoutes
  src/features/system/            # 系统管理模块（用户/角色/字典）
  src/features/icons/             # 图标注册
  src/shared/components/pro/      # ProTable/ProForm/SearchBar/IconSelect/DictTag
  src/shared/utils/dict.ts        # 字典工具函数

修改:
  src/app/bootstrap.ts            # 安装 Naive UI + i18n
  src/app/AppRoot.vue             # 添加 n-config-provider + providers
  src/core/router/routes.ts       # 添加 /login + /dashboard + /system/* 路由
  src/core/router/guards.ts       # 菜单数据生成逻辑
  src/features/auth/dynamic-routes.ts  # 添加 system 模块路由
  src/features/home/              # 登录页重构
  src/mocks/handlers.ts           # 添加 system 模块 mock
  vite.config.ts                  # 添加 unplugin-auto-import 配置
```

## 3. Naive UI 集成

### 安装

```bash
pnpm add naive-ui
pnpm add -D @vicons/ionicons5 unplugin-auto-import unplugin-vue-components
```

### 集成方式

- 使用 `unplugin-auto-import` + `unplugin-vue-components` 实现按需自动引入
- 在 `vite.config.ts` 中配置 AutoImport 插件
- 在 `AppRoot.vue` 中包裹 `n-config-provider`、`n-dialog-provider`、`n-notification-provider`、`n-message-provider`

### 主题定制

```ts
// src/core/theme/index.ts
const lightThemeOverrides: GlobalThemeOverrides = {
  common: { primaryColor: '#18a058', borderRadius: '6px' },
}
const darkThemeOverrides: GlobalThemeOverrides = {
  common: { primaryColor: '#63e2b7', borderRadius: '6px' },
}
```

## 4. 布局系统

### AdminLayout 结构

```
┌─────────────────────────────────────────────────┐
│                   AdminTopbar                    │
│  [折叠]  [面包屑]     [搜索] [主题] [通知] [全屏] [用户] │
├──────────┬──────────────────────────────────────┤
│          │        AdminTabs（多标签页）           │
│ Sidebar  ├──────────────────────────────────────┤
│          │          <RouterView />               │
│ [菜单树]  │          页面内容区                    │
└──────────┴──────────────────────────────────────┘
```

### 路由变更

```
/login       → LoginView（公开页）
/            → 重定向到 /dashboard
/dashboard   → AdminLayout > DashboardView
/workspace   → AdminLayout > WorkspaceView
/system/user → AdminLayout > UserManageView
/system/role → AdminLayout > RoleManageView
/system/dict → AdminLayout > DictManageView
/admin       → AdminLayout > AdminView
/forbidden   → ForbiddenView（独立页）
/*           → NotFoundView（独立页）
```

### 路由 meta 扩展

```ts
interface RouteMeta {
  title: string // 菜单文字（支持 i18n key）
  icon?: string // 图标名（xicons 命名）
  hidden?: boolean // 菜单中隐藏
  order?: number // 菜单排序
  requiresAuth?: boolean
  roles?: UserRole[]
  permissions?: string[]
  keepAlive?: boolean // 页面缓存
}
```

### 菜单生成

`useMenuRoutes` composable 从 `router.getRoutes()` 读取路由，过滤 `hidden`、按 `order` 排序、递归构建菜单树，输出 `NMenu` 需要的 `options` 格式。

## 5. 布局模式切换

### 支持的模式

| 模式             | 侧边栏          | 顶栏菜单        | 效果                       |
| ---------------- | --------------- | --------------- | -------------------------- |
| 侧边菜单（默认） | ✅ 左侧         | ❌              | 经典后台布局               |
| 顶部菜单         | ❌              | ✅ 顶栏         | 类 Ant Design Pro 顶部导航 |
| 混合菜单         | ✅ 左侧（一级） | ✅ 顶栏（二级） | 一级菜单在侧边，二级在顶部 |

### 布局配置持久化

```ts
// src/core/theme/useLayoutSetting.ts
interface LayoutSetting {
  mode: 'side' | 'top' | 'mix'
  showTabs: boolean
  showBreadcrumb: boolean
  fixedHeader: boolean
  sidebarCollapsed: boolean
  sidebarWidth: number
}
// 持久化到 localStorage
```

### 布局设置面板

顶栏右侧设置按钮（齿轮图标），点击打开 NDrawer 设置面板：

- 布局模式切换（三个图标按钮）
- 主题色选择
- 界面功能开关（多标签页/面包屑/固定顶栏/侧边折叠）
- 主题模式切换（亮色/暗色/跟随系统）

设置变更实时预览，持久化到 localStorage。

## 6. 主题系统

```ts
// src/core/theme/useTheme.ts
type ThemeMode = 'light' | 'dark' | 'system'

// 持久化到 localStorage
// 切换时: document.documentElement.classList.toggle('dark')
// Naive UI 通过 :theme="isDark ? darkTheme : undefined" 控制
// 监听系统主题变化 (matchMedia)
```

## 7. 图标系统

```bash
pnpm add @vicons/ionicons5
```

- 在 `src/features/icons/index.ts` 注册常用图标组件
- 在 `src/shared/components/pro/IconSelect.vue` 提供图标选择器
- 菜单和按钮使用图标名动态渲染

## 8. 登录页重构

```
当前: HomeView → HomeHeroPanel + 3 个 Login 按钮 + mock 登录
改造:
  /login → LoginView
    - NForm 表单：用户名 + 密码 + 角色下拉选择
    - 表单验证规则
    - "记住我" 复选框（localStorage 记住用户名）
    - 登录按钮 + loading 状态
  / → 重定向到 /dashboard（已登录）或 /login（未登录）
  HomeView → 保留为产品介绍页或删除
```

## 9. 系统管理模块

### 用户管理 (/system/user)

- ProTable 展示用户列表（分页 + 搜索：用户名/状态/角色）
- 新增/编辑弹窗（NForm：用户名/昵称/邮箱/手机/角色分配/状态）
- 删除确认
- 状态切换（启用/停用）
- Mock 数据：10 条示例用户

### 角色管理 (/system/role)

- ProTable 展示角色列表
- 新增/编辑弹窗（角色名/标识/排序/状态）
- 权限分配（树形勾选）
- Mock 数据：admin/editor/viewer 三个角色

### 字典管理 (/system/dict)

- 左右布局：左侧字典类型列表 + 右侧字典数据列表
- 字典类型 CRUD（类型名/类型编码/状态）
- 字典数据 CRUD（标签/值/排序/状态）
- Mock 数据：sys_user_status、sys_normal_disable 等

### 字典缓存

```ts
// src/features/system/store/useDictStore.ts
// loadDict(typeCode) → 缓存到 Map → 提供给 DictTag 组件使用
```

## 10. 通用增强组件

### ProTable

- 基于 NDataTable 封装
- Props: columns, request(异步函数), searchFields, pagination, toolbar, rowKey
- 自动管理 loading / data / 分页状态
- 搜索栏根据 searchFields 自动生成 NForm
- 工具栏：刷新 / 密度 / 全屏 / 列设置
- 操作列模板 slot

### ProForm

- 基于 NForm 封装
- Props: fields(字段配置数组), model, rules, layout
- 根据 fields 自动生成表单项（input/select/switch/date 等）
- 支持栅格布局

### SearchBar

- 独立搜索栏组件
- 展开/收起
- 搜索/重置按钮

### DictTag

- 根据字典类型和值渲染标签
- 支持不同类型显示（tag/text/badge）

## 11. 国际化

```ts
// src/core/i18n/index.ts
const i18n = createI18n({
  legacy: false,
  locale: localStorage.getItem('locale') || 'zh-CN',
  fallbackLocale: 'en-US',
  messages: { 'zh-CN': zhCN, 'en-US': enUS },
})
```

语言包范围：

- 菜单文字、面包屑
- 表单验证提示
- 通用操作（新增/编辑/删除/搜索/重置/确认/取消）
- 分页文字（共 X 条，第 X/Y 页）
- 登录页文字
- 不含业务数据

顶栏提供语言切换按钮，切换后持久化到 localStorage。

## 12. Mock 数据

在现有 MSW 体系基础上新增：

| Handler | 路径                           | 功能                    |
| ------- | ------------------------------ | ----------------------- |
| GET     | `/api/system/users`            | 用户列表（分页 + 搜索） |
| POST    | `/api/system/users`            | 新增用户                |
| PUT     | `/api/system/users/:id`        | 编辑用户                |
| DELETE  | `/api/system/users/:id`        | 删除用户                |
| GET     | `/api/system/roles`            | 角色列表                |
| POST    | `/api/system/roles`            | 新增角色                |
| PUT     | `/api/system/roles/:id`        | 编辑角色                |
| DELETE  | `/api/system/roles/:id`        | 删除角色                |
| GET     | `/api/system/dicts`            | 字典类型列表            |
| GET     | `/api/system/dicts/:type/data` | 字典数据列表            |

## 13. 实施顺序

| 阶段 | 模块                                | 依赖               |
| ---- | ----------------------------------- | ------------------ |
| P0   | Naive UI 集成 + 主题系统 + 布局设置 | 无                 |
| P0   | AdminLayout 布局（支持三种模式）    | Naive UI           |
| P0   | 路由改造 + 菜单联动                 | AdminLayout        |
| P0   | 登录页重构                          | Naive UI           |
| P1   | 图标系统                            | Naive UI           |
| P1   | 国际化                              | Naive UI           |
| P1   | ProTable / ProForm                  | Naive UI           |
| P1   | 系统管理页面（用户/角色/字典）      | ProTable + ProForm |
| P2   | SearchBar / DictTag / IconSelect    | ProTable           |
| P2   | 数据字典缓存 store                  | 系统管理           |
