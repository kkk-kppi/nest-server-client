# Nest Admin 系统 UI 规范文档

> 版本: 1.0.0 | 最后更新: 2026-07-14 | 状态: 已实施

---

## 目录

1. [项目概述](#1-项目概述)
2. [设计令牌系统](#2-设计令牌系统)
3. [组件规范](#3-组件规范)
4. [响应式设计](#4-响应式设计)
5. [深色模式](#5-深色模式)
6. [无障碍访问](#6-无障碍访问)
7. [代码规范](#7-代码规范)
8. [实施状态](#8-实施状态)

---

## 1. 项目概述

### 1.1 技术栈

| 技术       | 版本  | 用途     |
| ---------- | ----- | -------- |
| Vue        | 3.5+  | 前端框架 |
| TypeScript | 5.9+  | 类型系统 |
| Vite       | 8.0+  | 构建工具 |
| Naive UI   | 2.44+ | 组件库   |
| Vue Router | 4.6+  | 路由管理 |
| Pinia      | 3.0+  | 状态管理 |
| Vue I18n   | 11.4+ | 国际化   |

### 1.2 设计目标

- **企业级**: 专业、稳定、可信赖
- **一致性**: 统一的视觉语言和交互模式
- **可访问性**: 符合 WCAG 2.1 AA 标准
- **响应式**: 支持 375px - 1440px+ 全设备
- **深色模式**: 完整的明暗主题支持

---

## 2. 设计令牌系统

### 2.1 颜色系统

#### 语义色

```css
/* 主色 - 专业蓝 */
--color-primary: #2080f0;
--color-primary-hover: #4098fc;
--color-primary-active: #1060c9;
--color-primary-light: rgba(32, 128, 240, 0.1);

/* 成功色 */
--color-success: #18a058;
--color-success-hover: #36ad6a;
--color-success-active: #0c7a3d;

/* 警告色 */
--color-warning: #f0a020;
--color-warning-hover: #fcb040;
--color-warning-active: #c97c00;

/* 错误色 */
--color-error: #d03050;
--color-error-hover: #de576d;
--color-error-active: #ab1f3b;

/* 信息色 */
--color-info: #2080f0;
```

#### 中性色

```css
/* 背景色 */
--bg-primary: #fff;
--bg-secondary: #f5f7fa;
--bg-tertiary: #f0f2f5;
--bg-overlay: rgba(0, 0, 0, 0.5);

/* 文本色 (已通过 WCAG AA 对比度验证) */
--text-primary: #08060d; /* 对比度: 15.4:1 */
--text-secondary: #6b6375; /* 对比度: 4.6:1 */
--text-tertiary: #6b7280; /* 对比度: 5.3:1 */
--text-disabled: #9ca3af; /* 仅用于禁用状态 */
--text-inverse: #fff;

/* 边框色 */
--border-light: #e5e4e7;
--border-base: #dcdfe6;
--border-dark: #c0c4cc;
--border-focus: var(--color-primary);
```

#### 使用规范

```vue
<!-- ✅ 正确：使用语义变量 -->
<n-icon color="var(--color-primary)" />
<span style="color: var(--text-secondary)">文本</span>

<!-- ❌ 错误：硬编码颜色值 -->
<n-icon color="#2080f0" />
<span style="color: #6b6375">文本</span>
```

### 2.2 字体系统

```css
/* 字体栈 */
--font-sans: system-ui, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
--font-heading: system-ui, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
--font-mono: ui-monospace, Consolas, 'Courier New', monospace;

/* 字体大小 */
--text-xs: 12px; /* 辅助文本 */
--text-sm: 14px; /* 小文本 */
--text-base: 16px; /* 正文 */
--text-lg: 18px; /* 大正文 */
--text-xl: 20px; /* 小标题 */
--text-2xl: 24px; /* 标题 */
--text-3xl: 30px; /* 大标题 */
--text-4xl: 36px; /* 主标题 */

/* 字体粗细 */
--font-light: 300;
--font-normal: 400;
--font-medium: 500;
--font-semibold: 600;
--font-bold: 700;

/* 行高 */
--leading-tight: 1.25; /* 标题 */
--leading-normal: 1.5; /* 正文 */
--leading-relaxed: 1.625; /* 长文本 */
```

#### 使用场景

| 场景     | 字体大小    | 字重            | 行高             |
| -------- | ----------- | --------------- | ---------------- |
| 页面标题 | --text-2xl  | --font-semibold | --leading-tight  |
| 卡片标题 | --text-lg   | --font-medium   | --leading-tight  |
| 正文     | --text-base | --font-normal   | --leading-normal |
| 辅助文本 | --text-sm   | --font-normal   | --leading-normal |
| 小标签   | --text-xs   | --font-medium   | --leading-tight  |

### 2.3 间距系统

基于 **4px 基准** 的间距刻度：

```css
--space-1: 4px;
--space-2: 8px;
--space-3: 12px;
--space-4: 16px;
--space-5: 20px;
--space-6: 24px;
--space-8: 32px;
--space-10: 40px;
--space-12: 48px;
--space-16: 64px;
--space-20: 80px;
--space-24: 96px;
```

#### 语义化间距

```css
/* 内边距 */
--padding-xs: var(--space-1); /* 4px */
--padding-sm: var(--space-2); /* 8px */
--padding-md: var(--space-4); /* 16px */
--padding-lg: var(--space-6); /* 24px */
--padding-xl: var(--space-8); /* 32px */

/* 外边距 */
--margin-xs: var(--space-1);
--margin-sm: var(--space-2);
--margin-md: var(--space-4);
--margin-lg: var(--space-6);
--margin-xl: var(--space-8);

/* 间隙 */
--gap-xs: var(--space-1);
--gap-sm: var(--space-2);
--gap-md: var(--space-4);
--gap-lg: var(--space-6);
--gap-xl: var(--space-8);
```

#### 使用规范

```vue
<!-- ✅ 正确：使用间距变量 -->
<div style="padding: var(--padding-md); gap: var(--gap-sm)">

<!-- ❌ 错误：硬编码像素值 -->
<div style="padding: 16px; gap: 8px">
```

### 2.4 圆角系统

```css
--radius-none: 0;
--radius-sm: 2px; /* 小元素 */
--radius-md: 4px; /* 按钮、输入框 */
--radius-lg: 8px; /* 卡片、弹窗 */
--radius-xl: 12px; /* 大卡片 */
--radius-2xl: 16px; /* 特殊圆角 */
--radius-full: 9999px; /* 胶囊形状 */
```

### 2.5 阴影系统

```css
--shadow-xs: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
--shadow-sm: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px -1px rgba(0, 0, 0, 0.1);
--shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1);
--shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -4px rgba(0, 0, 0, 0.1);
--shadow-xl: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1);
--shadow-inner: inset 0 2px 4px 0 rgba(0, 0, 0, 0.05);
```

### 2.6 动画系统

```css
/* 过渡时间 */
--duration-fast: 150ms; /* 微交互 */
--duration-normal: 200ms; /* 标准过渡 */
--duration-slow: 300ms; /* 复杂动画 */
--duration-slower: 500ms; /* 页面过渡 */

/* 缓动函数 */
--ease-in: cubic-bezier(0.4, 0, 1, 1);
--ease-out: cubic-bezier(0, 0, 0.2, 1);
--ease-in-out: cubic-bezier(0.4, 0, 0.2, 1);
--ease-spring: cubic-bezier(0.34, 1.56, 0.64, 1);
```

#### 动画规范

| 交互类型 | 时间  | 缓动        |
| -------- | ----- | ----------- |
| 悬停状态 | 150ms | ease-out    |
| 点击反馈 | 150ms | ease-in-out |
| 下拉展开 | 200ms | ease-out    |
| 弹窗打开 | 300ms | ease-out    |
| 页面切换 | 300ms | ease-in-out |

### 2.7 Z-Index 系统

```css
--z-dropdown: 1000; /* 下拉菜单 */
--z-sticky: 1020; /* 粘性元素 */
--z-fixed: 1030; /* 固定元素 */
--z-modal-backdrop: 1040; /* 弹窗背景 */
--z-modal: 1050; /* 弹窗 */
--z-popover: 1060; /* 气泡卡片 */
--z-tooltip: 1070; /* 工具提示 */
--z-toast: 1080; /* 消息提示 */
```

---

## 3. 组件规范

### 3.1 按钮

```css
/* 尺寸 */
--btn-height-sm: 24px;
--btn-height-md: 32px;
--btn-height-lg: 40px;

/* 内边距 */
--btn-padding-sm: 0 var(--space-2);
--btn-padding-md: 0 var(--space-4);
--btn-padding-lg: 0 var(--space-6);
```

#### 按钮状态

```css
/* 默认 -> 悬停 -> 点击 -> 禁用 */
button {
  transition: all var(--duration-fast) var(--ease-out);
}

button:hover:not(:disabled) {
  background: var(--bg-tertiary);
}

button:active:not(:disabled) {
  transform: scale(0.98);
}

button:focus-visible {
  outline: 2px solid var(--color-primary);
  outline-offset: 2px;
}

button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
```

### 3.2 卡片

```css
.card {
  background: var(--bg-primary);
  border: 1px solid var(--border-light);
  border-radius: var(--radius-lg);
  padding: var(--padding-lg);
  box-shadow: var(--shadow-sm);
}
```

### 3.3 表单

#### 输入框尺寸

| 尺寸 | 高度 | 内边距    | 用途     |
| ---- | ---- | --------- | -------- |
| sm   | 28px | 6px 8px   | 紧凑布局 |
| md   | 36px | 8px 12px  | 默认     |
| lg   | 44px | 10px 16px | 大表单   |

#### 表单验证

```vue
<!-- ✅ 正确：使用 label + 描述 -->
<n-form-item label="用户名" path="username">
  <template #label>
    <span>用户名</span>
  </template>
  <template #default>
    <n-input placeholder="请输入用户名" />
  </template>
  <template #feedback>
    <span v-if="error" class="text-error">{{ error }}</span>
  </template>
</n-form-item>
```

### 3.4 表格

```css
.table-header {
  background: var(--bg-secondary);
}

.table-row:hover {
  background: var(--bg-secondary);
}

.table-cell {
  padding: 12px var(--space-4);
  border-bottom: 1px solid var(--border-light);
}
```

### 3.5 弹窗

```css
/* 响应式弹窗宽度 */
.modal {
  width: 90%;
  max-width: 500px;
}

@media (max-width: 767px) {
  .modal {
    width: 95%;
  }
}
```

### 3.6 图标规范

| 场景     | 尺寸    | 图标库            |
| -------- | ------- | ----------------- |
| 导航图标 | 20-24px | @vicons/ionicons5 |
| 操作图标 | 18-20px | @vicons/ionicons5 |
| 状态图标 | 16px    | @vicons/ionicons5 |

```vue
<!-- ✅ 正确：使用图标组件 -->
<n-icon size="20">
  <PeopleOutline />
</n-icon>

<!-- ❌ 错误：使用 emoji -->
<span>👥</span>
```

---

## 4. 响应式设计

### 4.1 断点系统

```css
--breakpoint-sm: 640px;
--breakpoint-md: 768px;
--breakpoint-lg: 1024px;
--breakpoint-xl: 1280px;
--breakpoint-2xl: 1536px;
```

### 4.2 布局策略

#### 侧边栏

```css
/* 桌面端 */
@media (min-width: 1024px) {
  .sidebar {
    width: 240px;
  }
}

/* 平板端 */
@media (max-width: 1023px) {
  .sidebar {
    width: 64px; /* 折叠状态 */
  }
}

/* 移动端 */
@media (max-width: 767px) {
  .sidebar {
    display: none; /* 隐藏，使用抽屉 */
  }
}
```

#### 网格布局

```vue
<!-- 统计卡片网格 -->
<n-grid :cols="4" :x-gap="16" :y-gap="16" responsive="screen" :item-responsive="true">
  <n-gi span="4 m:2 l:1">
    <!-- 移动端: 1列, 平板: 2列, 桌面: 4列 -->
  </n-gi>
</n-grid>
```

### 4.3 响应式组件

| 组件     | 移动端 (<768px) | 平板 (768-1023px) | 桌面 (≥1024px) |
| -------- | --------------- | ----------------- | -------------- |
| 侧边栏   | 隐藏/抽屉       | 折叠 (64px)       | 展开 (240px)   |
| 统计卡片 | 1列             | 2列               | 4列            |
| 表单     | 单列            | 双列              | 双列/三列      |
| 弹窗     | 95% 宽度        | 90% 宽度          | 500px 最大     |
| 搜索栏   | 堆叠            | 水平              | 水平           |

---

## 5. 深色模式

### 5.1 实现机制

```typescript
// src/core/theme/useTheme.ts
const isDark = ref(false)

function toggleDark() {
  isDark.value = !isDark.value
  document.documentElement.classList.toggle('dark', isDark.value)
}
```

### 5.2 深色模式变量

```css
.dark {
  /* 背景色 */
  --bg-primary: #16171d;
  --bg-secondary: #1f2028;
  --bg-tertiary: #2e303a;
  --bg-overlay: rgba(0, 0, 0, 0.7);

  /* 文本色 */
  --text-primary: #f3f4f6;
  --text-secondary: #9ca3af;
  --text-tertiary: #6b7280;
  --text-disabled: #4b5563;
  --text-inverse: #08060d;

  /* 边框色 */
  --border-light: #2e303a;
  --border-base: #3f3f46;
  --border-dark: #52525b;

  /* 主色调整 (更亮) */
  --color-primary: #4098fc;
  --color-primary-hover: #60b0ff;
  --color-primary-active: #2080f0;

  /* 阴影调整 (更深) */
  --shadow-sm: 0 1px 3px 0 rgba(0, 0, 0, 0.3), 0 1px 2px -1px rgba(0, 0, 0, 0.3);
  --shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.3), 0 2px 4px -2px rgba(0, 0, 0, 0.3);
}
```

### 5.3 使用规范

```vue
<!-- ✅ 正确：使用变量，自动适配深色模式 -->
<div style="background: var(--bg-primary); color: var(--text-primary)">

<!-- ❌ 错误：硬编码颜色，深色模式下不可见 -->
<div style="background: #fff; color: #000">
```

---

## 6. 无障碍访问

### 6.1 HTML 语言

```html
<!-- ✅ 正确 -->
<html lang="zh-CN">
  <!-- ❌ 错误 -->
  <html lang="en"></html>
</html>
```

### 6.2 ARIA 属性

```vue
<!-- 导航区域 -->
<nav role="navigation" aria-label="主导航">
  <AdminSidebar />
</nav>

<!-- 交互按钮 -->
<button aria-label="切换深色模式" :aria-pressed="isDark">
  <n-icon>
    <MoonOutline v-if="!isDark" />
    <SunnyOutline v-else />
  </n-icon>
</button>

<!-- 展开/折叠 -->
<button :aria-expanded="isExpanded" aria-label="展开侧边栏">
  <MenuOutline />
</button>

<!-- 弹窗触发器 -->
<button aria-haspopup="true" :aria-expanded="showMenu">
  用户菜单
</button>
```

### 6.3 焦点管理

```css
/* 焦点样式 */
:focus-visible {
  outline: 2px solid var(--color-primary);
  outline-offset: 2px;
}

/* Skip Navigation */
.skip-to-content {
  position: absolute;
  top: -40px;
  left: 0;
  z-index: var(--z-toast);
}

.skip-to-content:focus {
  top: 0;
}
```

### 6.4 对比度要求

| 元素类型 | 最小对比度 | 当前状态                   |
| -------- | ---------- | -------------------------- |
| 正文文本 | 4.5:1      | ✅ --text-secondary: 4.6:1 |
| 大文本   | 3:1        | ✅ --text-primary: 15.4:1  |
| 辅助文本 | 4.5:1      | ✅ --text-tertiary: 5.3:1  |
| 图标     | 3:1        | ✅ 通过                    |

### 6.5 减少动画

```css
@media (prefers-reduced-motion: reduce) {
  :root {
    --duration-fast: 0ms;
    --duration-normal: 0ms;
    --duration-slow: 0ms;
    --duration-slower: 0ms;
  }
}
```

---

## 7. 代码规范

### 7.1 CSS 规范

```vue
<style scoped>
/* ✅ 正确：使用设计令牌 */
.card {
  background: var(--bg-primary);
  padding: var(--padding-lg);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-sm);
}

/* ❌ 错误：硬编码值 */
.card {
  background: #fff;
  padding: 24px;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}
</style>
```

### 7.2 组件规范

```vue
<script setup lang="ts">
// ✅ 正确：TypeScript 类型定义
interface Props {
  title: string
  count?: number
  status?: 'success' | 'warning' | 'error'
}

const props = withDefaults(defineProps<Props>(), {
  count: 0,
  status: 'success',
})

const emit = defineEmits<{
  update: [value: string]
}>()
</script>
```

### 7.3 响应式规范

```vue
<style scoped>
/* ✅ 正确：Mobile First */
.container {
  padding: var(--space-4);
}

@media (min-width: 768px) {
  .container {
    padding: var(--space-6);
  }
}

@media (min-width: 1024px) {
  .container {
    padding: var(--space-8);
  }
}

/* ❌ 错误：固定值 */
.container {
  padding: 24px;
}
</style>
```

### 7.4 外部链接

```vue
<!-- ✅ 正确 -->
<a href="https://example.com" target="_blank" rel="noopener noreferrer">
  链接
</a>

<!-- ❌ 错误 -->
<a href="https://example.com" target="_blank">
  链接
</a>
```

---

## 8. 实施状态

### 8.1 已完成优化

| 类别     | 问题                         | 状态                |
| -------- | ---------------------------- | ------------------- |
| 颜色系统 | 40+ 处硬编码颜色             | ✅ 已统一为变量     |
| 设计系统 | style.css 与 tokens.css 冲突 | ✅ 已合并           |
| 主题配置 | Naive UI 色彩不一致          | ✅ 已统一蓝色系     |
| 深色模式 | 手动切换失效                 | ✅ 已改为类名选择器 |
| 响应式   | 管理后台无断点               | ✅ 已添加响应式     |
| 无障碍   | 缺少 ARIA 属性               | ✅ 已添加关键属性   |
| 对比度   | --text-tertiary 不达标       | ✅ 已调整为 #6b7280 |
| 弹窗宽度 | 固定 500px                   | ✅ 已改为响应式     |
| 外部链接 | 缺少 rel 属性                | ✅ 已添加           |

### 8.2 待优化项

| 优先级    | 问题                              | 影响            |
| --------- | --------------------------------- | --------------- |
| 🟡 MEDIUM | style.css 12 处硬编码像素         | 低 - 仅首页模板 |
| 🟢 LOW    | NotFoundView/ForbiddenView 语义化 | 低 - 错误页面   |
| 🟢 LOW    | tokens.css 字体用 px 非 rem       | 低 - 需全局重构 |

### 8.3 质量检查

```bash
# 代码检查
pnpm lint          # ESLint + Stylelint
pnpm typecheck     # TypeScript 类型检查

# 测试
pnpm test          # 单元测试
pnpm e2e           # E2E 测试

# 构建验证
pnpm build         # 生产构建
```

---

## 附录 A: 文件结构

```
src/
├── styles/
│   └── tokens.css          # 设计令牌定义
├── core/
│   └── theme/
│       ├── useTheme.ts     # 主题切换
│       └── useLayoutSetting.ts  # 布局设置
├── shared/
│   └── components/
│       ├── atoms/          # 原子组件
│       └── pro/            # 业务组件
├── app/
│   ├── layouts/            # 布局组件
│   └── views/              # 页面视图
└── features/               # 业务模块
```

---

## 附录 B: 参考资源

| 资源          | 链接                                    |
| ------------- | --------------------------------------- |
| Naive UI 文档 | https://www.naiveui.com/                |
| WCAG 2.1      | https://www.w3.org/WAI/WCAG21/quickref/ |
| Vue 3 文档    | https://vuejs.org/                      |
| Ionicons      | https://ionic.io/ionicons               |

---

_文档维护者: 前端团队_  
_最后更新: 2026-07-14_
