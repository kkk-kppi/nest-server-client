# UI 优化设计文档

## 概述

对 nest-server-client 项目进行全面的 UI 优化，采用现代简约风格（Linear/Vercel 风格），统一设计令牌系统，优化登录页、仪表盘、侧边栏等核心界面。

## 设计目标

- 统一两套重复的设计令牌系统
- 采用现代简约风格，干净、留白多、轻量阴影
- 保持蓝色主色调 `#2080f0`
- 仪表盘作为系统首页
- 侧边栏显示 Logo + 系统名称

## 技术约束

- 基于现有 Naive UI 组件库进行样式定制
- 保持 Vue 3 + TypeScript + Vite 技术栈
- 遵循现有项目架构（app/core/features/shared）
- 保持现有路由结构和权限系统

---

## 1. 设计令牌统一

### 1.1 问题分析

当前存在两套设计令牌系统：

- `src/styles/design-system-tokens.css`：青绿色主题，使用 `--ds-` 前缀
- `src/styles/tokens.css`：蓝色主题，无前缀

两套系统颜色冲突，导致样式不一致。

### 1.2 解决方案

**删除** `design-system-tokens.css`，将所有令牌统一到 `tokens.css`。

**保留蓝色主题**：

```css
--color-primary: #2080f0;
--color-primary-hover: #4098fc;
--color-primary-active: #1060c9;
```

**更新 Naive UI themeOverrides**（`src/core/theme/index.ts`）：

```typescript
export const lightThemeOverrides: GlobalThemeOverrides = {
  common: {
    primaryColor: '#2080f0',
    primaryColorHover: '#4098fc',
    primaryColorPressed: '#1060c9',
    borderRadius: '8px', // 从 6px 增加到 8px
    // ... 其他颜色保持不变
  },
  Card: {
    borderRadius: '12px',
  },
  Button: {
    borderRadius: '8px',
  },
}
```

**字体更新**：

```css
:root {
  font-family: 'Plus Jakarta Sans', system-ui, 'Segoe UI', Roboto, sans-serif;
}
```

### 1.3 影响范围

- 删除：`src/styles/design-system-tokens.css`
- 修改：`src/styles/tokens.css`（移除对 design-system-tokens.css 的导入）
- 修改：`src/core/theme/index.ts`（更新 themeOverrides）
- 修改：`src/style.css`（更新字体引用）

---

## 2. 登录页重新设计

### 2.1 当前状态

`src/features/home/views/LoginView.vue`：简单的居中卡片表单，无品牌元素。

### 2.2 设计方案

**布局**：左右分栏

- 左侧：品牌展示区（渐变背景 + Logo + 系统介绍）
- 右侧：登录表单

**视觉风格**：

- 背景：浅灰色 `#f5f7fa`
- 左侧渐变：`linear-gradient(135deg, #2080f0 0%, #4098fc 100%)`
- 卡片：白色，圆角 16px，轻量阴影
- 按钮：主色填充，圆角 8px

**表单字段**：

- 用户名输入框
- 密码输入框
- 记住我复选框
- 登录按钮

**响应式**：

- 移动端：隐藏左侧品牌区，只显示表单

### 2.3 文件变更

- 修改：`src/features/home/views/LoginView.vue`

---

## 3. 首页路由调整

### 3.1 当前状态

路由配置位于 `src/core/router/routes.ts`，当前结构：

- `/` → 重定向到 `/dashboard`（已配置）
- `/login` → `LoginView.vue`
- `/dashboard` → `DashboardView.vue`

`HomeView.vue` 和 `HomeHeroPanel.vue` 未被路由引用，是残留的 Vite 模板代码。

### 3.2 设计方案

**路由无需修改**，当前配置已正确。

**清理残留代码**：

- 删除 `src/features/home/views/HomeView.vue`（未使用）
- 删除 `src/features/home/components/HomeHeroPanel.vue`（未使用）
- 删除 `src/features/home/components/HomeHeroPanel.test.ts`

### 3.3 文件变更

- 删除：`src/features/home/views/HomeView.vue`
- 删除：`src/features/home/components/HomeHeroPanel.vue`
- 删除：`src/features/home/components/HomeHeroPanel.test.ts`

---

## 4. 仪表盘优化

### 4.1 当前状态

`src/app/views/DashboardView.vue`：4 个统计卡片 + 欢迎信息 + 最近活动列表。

### 4.2 设计方案

**顶部欢迎区域**：

```
┌─────────────────────────────────────────────────┐
│  👋 欢迎回来，admin                               │
│  今天是 2026年7月14日 星期二                       │
│                              [用户管理] [工作空间] │
└─────────────────────────────────────────────────┘
```

**统计卡片优化**：

- 添加卡片 hover 效果（微弱阴影提升）
- 优化数值显示（大号数字 + 趋势箭头）
- 移除硬编码的 mock 数据，使用 `-` 占位

**快捷入口区域**（新增）：

```
┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐
│ 👥       │ │ 📁       │ │ ⚙️       │ │ 📋       │
│ 用户管理 │ │ 工作空间 │ │ 系统设置 │ │ 审计日志 │
└──────────┘ └──────────┘ └──────────┘ └──────────┘
```

**最近活动优化**：

- 使用更简洁的列表样式
- 添加时间线视觉效果

### 4.3 文件变更

- 修改：`src/app/views/DashboardView.vue`

---

## 5. 侧边栏品牌标识

### 5.1 当前状态

`src/app/layouts/components/AdminSidebar.vue`：显示 "Admin System" 或 "AS" 文字。

### 5.2 设计方案

**Logo 图标**：使用 SVG 图标（可使用 Ionicons 的 `grid-outline` 或自定义 Logo）

**布局**：

```
展开状态：
┌────────────────┐
│ [Logo] Admin   │
│     System     │
├────────────────┤
│ 菜单项...      │
└────────────────┘

收起状态：
┌────┐
│ [L]│
├────┤
│ 菜 │
│ 单 │
└────┘
```

**样式**：

- Logo 尺寸：28x28px
- 文字：font-weight 600，font-size 16px
- 间距：Logo 和文字之间 10px

### 5.3 文件变更

- 修改：`src/app/layouts/components/AdminSidebar.vue`

---

## 6. 全局样式优化

### 6.1 自定义滚动条

```css
::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}

::-webkit-scrollbar-track {
  background: transparent;
}

::-webkit-scrollbar-thumb {
  background: var(--border-base);
  border-radius: 3px;
}

::-webkit-scrollbar-thumb:hover {
  background: var(--border-dark);
}
```

### 6.2 页面切换动画

在 `AppRoot.vue` 的 `<RouterView>` 外添加过渡：

```vue
<router-view v-slot="{ Component }">
  <transition name="fade" mode="out-in">
    <component :is="Component" />
  </transition>
</router-view>
```

```css
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
```

### 6.3 卡片 hover 效果

```css
.n-card {
  transition:
    box-shadow 0.2s ease,
    transform 0.2s ease;
}

.n-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}
```

### 6.4 文件变更

- 修改：`src/style.css`
- 修改：`src/app/AppRoot.vue`

---

## 7. 实现顺序

1. **设计令牌统一**（基础）
2. **全局样式优化**（滚动条、动画、卡片效果）
3. **侧边栏品牌标识**
4. **登录页重新设计**
5. **首页路由调整**
6. **仪表盘优化**

---

## 8. 验收标准

- [ ] 设计令牌统一，无颜色冲突
- [ ] 登录页显示品牌 Logo 和渐变背景
- [ ] 访问 `/` 自动跳转到 `/dashboard`
- [ ] 仪表盘显示欢迎区域和快捷入口
- [ ] 侧边栏显示 Logo 图标 + 系统名称
- [ ] 页面切换有 fade 动画
- [ ] 滚动条样式统一
- [ ] 卡片 hover 有阴影效果
- [ ] 移动端响应式正常
- [ ] 深色模式正常工作
- [ ] `pnpm typecheck` 通过
- [ ] `pnpm lint` 通过
- [ ] `pnpm build` 通过
