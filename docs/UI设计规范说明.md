# Admin Dashboard 设计系统

## 概述

本设计系统基于 UI/UX Pro Max 技能生成，为后台管理系统提供完整的 UI 规范和设计令牌。

## 文件结构

```
docs/
├── UI设计规范.md      # 完整的设计系统规范文档
└── UI设计规范说明.md  # 本说明文件

src/styles/
└── tokens.css         # CSS 设计令牌配置
```

## 快速开始

### 1. 引入设计令牌

在你的主入口文件（如 `main.ts` 或 `App.vue`）中引入：

```typescript
import '@/styles/tokens.css'
```

### 2. 使用 CSS 变量

在组件中使用设计令牌：

```vue
<template>
  <div class="card">
    <h2 class="card-title">标题</h2>
    <p class="card-content">内容</p>
  </div>
</template>

<style scoped>
.card {
  background: var(--bg-primary);
  border: 1px solid var(--border-light);
  border-radius: var(--radius-lg);
  padding: var(--padding-lg);
  box-shadow: var(--shadow-sm);
}

.card-title {
  font-size: var(--text-xl);
  font-weight: var(--font-semibold);
  color: var(--text-primary);
  margin-bottom: var(--margin-md);
}

.card-content {
  font-size: var(--text-base);
  color: var(--text-secondary);
  line-height: var(--leading-normal);
}
</style>
```

### 3. 使用工具类

```vue
<template>
  <div class="p-4 rounded-lg shadow-md">
    <h1 class="text-2xl font-bold">标题</h1>
    <p class="text-sm font-normal">内容</p>
  </div>
</template>
```

## 设计令牌分类

### 颜色系统

- **主色**: 专业蓝 (#2080f0)
- **成功色**: 成功绿 (#18a058)
- **警告色**: 警告黄 (#f0a020)
- **错误色**: 错误红 (#d03050)
- **中性色**: 背景、文本、边框等

### 字体系统

- **字体栈**: 系统字体
- **字体大小**: 12px - 48px
- **行高**: 1 - 2
- **字间距**: -0.05em - 0.1em

### 间距系统

- **基础间距**: 4px 基准 (4, 8, 12, 16, 20, 24, 32, 40, 48, 64, 80, 96px)
- **组件间距**: 内边距、外边距、间隙

### 圆角系统

- **无圆角**: 0
- **小圆角**: 2px
- **中圆角**: 4px
- **大圆角**: 8px
- **超大圆角**: 12px, 16px, 24px
- **全圆角**: 9999px

### 阴影系统

- **超小阴影**: xs
- **小阴影**: sm
- **中阴影**: md
- **大阴影**: lg
- **超大阴影**: xl, 2xl
- **内阴影**: inner

### 动画系统

- **过渡时间**: 150ms, 200ms, 300ms, 500ms
- **缓动函数**: ease-in, ease-out, ease-in-out, spring

### 响应式断点

- **小屏**: 640px
- **中屏**: 768px
- **大屏**: 1024px
- **超大屏**: 1280px
- **超超大屏**: 1536px

## 深色模式

设计系统自动支持深色模式，通过 `prefers-color-scheme: dark` 媒体查询自动切换。

## 无障碍支持

- **对比度**: 符合 WCAG 2.1 标准
- **焦点状态**: 可见的焦点指示器
- **键盘导航**: 支持 Tab 键导航
- **屏幕阅读器**: 语义化 HTML 和 ARIA 标签

## 性能优化

- **GPU 加速**: 使用 transform 和 opacity
- **虚拟滚动**: 长列表优化
- **懒加载**: 图片和组件懒加载
- **防抖节流**: 输入和滚动事件处理

## 开发规范

### CSS 规范

- 使用 CSS 自定义属性（变量）
- 遵循 BEM 命名规范
- 优先使用 rem 单位

### 组件规范

- 使用 TypeScript 定义 Props
- 使用 defineEmits 定义事件
- 使用 defineSlots 定义插槽

### 代码风格

- Prettier 格式化
- ESLint + Stylelint 检查
- Conventional Commits 提交规范

## 相关资源

- [Naive UI 文档](https://www.naiveui.com/)
- [Ionicons 图标](https://ionic.io/ionicons)
- [WCAG 2.1 规范](https://www.w3.org/WAI/WCAG21/quickref/)

## 更新日志

### v1.0.0 (2026-07-12)

- 初始版本发布
- 完整的颜色、字体、间距、圆角、阴影系统
- 深色模式支持
- 响应式设计支持
- 无障碍支持
- 性能优化建议
