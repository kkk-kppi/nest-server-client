# Admin Dashboard 设计系统

## 项目概述

- **项目类型**: 后台管理系统
- **技术栈**: Vue 3 + TypeScript + Vite + Naive UI
- **图标库**: @vicons/ionicons5
- **设计风格**: 现代简约、专业、高效

---

## 1. 颜色系统

### 1.1 主色调

```css
:root {
  /* 主色 - 专业蓝 */
  --color-primary: #2080f0;
  --color-primary-hover: #4098fc;
  --color-primary-active: #1060c9;
  --color-primary-light: rgba(32, 128, 240, 0.1);

  /* 辅助色 - 成功绿 */
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
}
```

### 1.2 中性色

```css
:root {
  /* 背景色 */
  --bg-primary: #ffffff;
  --bg-secondary: #f5f7fa;
  --bg-tertiary: #f0f2f5;

  /* 文本色 */
  --text-primary: #08060d;
  --text-secondary: #6b6375;
  --text-tertiary: #9ca3af;
  --text-disabled: #c0c4cc;

  /* 边框色 */
  --border-light: #e5e4e7;
  --border-base: #dcdfe6;
  --border-dark: #c0c4cc;

  /* 阴影 */
  --shadow-light: rgba(0, 0, 0, 0.05);
  --shadow-base: rgba(0, 0, 0, 0.1);
  --shadow-dark: rgba(0, 0, 0, 0.15);
}
```

### 1.3 深色模式

```css
@media (prefers-color-scheme: dark) {
  :root {
    /* 背景色 */
    --bg-primary: #16171d;
    --bg-secondary: #1f2028;
    --bg-tertiary: #2e303a;

    /* 文本色 */
    --text-primary: #f3f4f6;
    --text-secondary: #9ca3af;
    --text-tertiary: #6b7280;
    --text-disabled: #4b5563;

    /* 边框色 */
    --border-light: #2e303a;
    --border-base: #3f3f46;
    --border-dark: #52525b;

    /* 主色调整 */
    --color-primary: #4098fc;
    --color-primary-hover: #60b0ff;
    --color-primary-active: #2080f0;

    /* 阴影 */
    --shadow-light: rgba(0, 0, 0, 0.2);
    --shadow-base: rgba(0, 0, 0, 0.3);
    --shadow-dark: rgba(0, 0, 0, 0.4);
  }
}
```

---

## 2. 字体系统

### 2.1 字体栈

```css
:root {
  /* 主字体 - 系统字体栈 */
  --font-sans: system-ui, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;

  /* 标题字体 */
  --font-heading: system-ui, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;

  /* 等宽字体 */
  --font-mono: ui-monospace, Consolas, 'Courier New', monospace;
}
```

### 2.2 字体大小

```css
:root {
  /* 字体大小 */
  --text-xs: 12px;
  --text-sm: 14px;
  --text-base: 16px;
  --text-lg: 18px;
  --text-xl: 20px;
  --text-2xl: 24px;
  --text-3xl: 30px;
  --text-4xl: 36px;

  /* 行高 */
  --leading-none: 1;
  --leading-tight: 1.25;
  --leading-snug: 1.375;
  --leading-normal: 1.5;
  --leading-relaxed: 1.625;
  --leading-loose: 2;

  /* 字间距 */
  --tracking-tighter: -0.05em;
  --tracking-tight: -0.025em;
  --tracking-normal: 0;
  --tracking-wide: 0.025em;
  --tracking-wider: 0.05em;
  --tracking-widest: 0.1em;
}
```

### 2.3 字体粗细

```css
:root {
  --font-light: 300;
  --font-normal: 400;
  --font-medium: 500;
  --font-semibold: 600;
  --font-bold: 700;
}
```

---

## 3. 间距系统

### 3.1 基础间距

```css
:root {
  /* 4px 基准间距 */
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
}
```

### 3.2 组件间距

```css
:root {
  /* 组件内边距 */
  --padding-xs: 4px;
  --padding-sm: 8px;
  --padding-md: 16px;
  --padding-lg: 24px;
  --padding-xl: 32px;

  /* 组件外边距 */
  --margin-xs: 4px;
  --margin-sm: 8px;
  --margin-md: 16px;
  --margin-lg: 24px;
  --margin-xl: 32px;

  /* 间隙 */
  --gap-xs: 4px;
  --gap-sm: 8px;
  --gap-md: 16px;
  --gap-lg: 24px;
  --gap-xl: 32px;
}
```

---

## 4. 圆角系统

```css
:root {
  --radius-none: 0;
  --radius-sm: 2px;
  --radius-md: 4px;
  --radius-lg: 8px;
  --radius-xl: 12px;
  --radius-2xl: 16px;
  --radius-full: 9999px;
}
```

---

## 5. 阴影系统

```css
:root {
  /* 阴影 */
  --shadow-xs: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
  --shadow-sm: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px -1px rgba(0, 0, 0, 0.1);
  --shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1);
  --shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -4px rgba(0, 0, 0, 0.1);
  --shadow-xl: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1);

  /* 内阴影 */
  --shadow-inner: inset 0 2px 4px 0 rgba(0, 0, 0, 0.05);
}
```

---

## 6. 动画系统

### 6.1 过渡时间

```css
:root {
  /* 过渡时间 */
  --duration-fast: 150ms;
  --duration-normal: 200ms;
  --duration-slow: 300ms;
  --duration-slower: 500ms;

  /* 缓动函数 */
  --ease-in: cubic-bezier(0.4, 0, 1, 1);
  --ease-out: cubic-bezier(0, 0, 0.2, 1);
  --ease-in-out: cubic-bezier(0.4, 0, 0.2, 1);
}
```

### 6.2 动画规范

- **微交互**: 150-300ms
- **页面过渡**: 300-500ms
- **悬停状态**: 200ms ease-out
- **点击反馈**: 150ms ease-in-out

---

## 7. 响应式断点

```css
:root {
  /* 断点 */
  --breakpoint-sm: 640px;
  --breakpoint-md: 768px;
  --breakpoint-lg: 1024px;
  --breakpoint-xl: 1280px;
  --breakpoint-2xl: 1536px;
}
```

### 响应式策略

- **Mobile First**: 优先设计移动端
- **断点**: 375px → 768px → 1024px → 1440px
- **布局**: 使用 Flexbox 和 Grid
- **间距**: 小屏幕减少间距，大屏幕增加间距

---

## 8. 组件规范

### 8.1 按钮

```css
/* 按钮尺寸 */
--btn-height-sm: 24px;
--btn-height-md: 32px;
--btn-height-lg: 40px;

/* 按钮内边距 */
--btn-padding-sm: 0 8px;
--btn-padding-md: 0 16px;
--btn-padding-lg: 0 24px;
```

**交互状态**:

- 默认 → 悬停 (200ms) → 点击 (150ms) → 禁用
- 焦点状态: 2px outline, offset 2px

### 8.2 卡片

```css
/* 卡片样式 */
--card-bg: var(--bg-primary);
--card-border: var(--border-light);
--card-radius: var(--radius-lg);
--card-shadow: var(--shadow-sm);
--card-padding: var(--padding-lg);
```

### 8.3 表单

**输入框规范**:

- 高度: 32px (sm), 40px (md), 48px (lg)
- 内边距: 8px 12px
- 边框: 1px solid var(--border-base)
- 焦点: 2px solid var(--color-primary)

**标签规范**:

- 位置: 输入框上方
- 字体: var(--text-sm)
- 颜色: var(--text-secondary)

### 8.4 表格

```css
/* 表格样式 */
--table-header-bg: var(--bg-secondary);
--table-row-hover: var(--bg-secondary);
--table-border: var(--border-light);
--table-cell-padding: 12px 16px;
```

---

## 9. 图标规范

### 9.1 图标库

- **主要图标库**: @vicons/ionicons5
- **图标风格**: Outline (线性)
- **图标尺寸**: 16px, 18px, 20px, 24px

### 9.2 图标使用规范

- **导航图标**: 20-24px
- **操作图标**: 18-20px
- **状态图标**: 16px
- **触摸目标**: 最小 44x44px

---

## 10. 布局规范

### 10.1 侧边栏

- **宽度**: 240px (展开), 64px (折叠)
- **背景**: var(--bg-primary)
- **边框**: 1px solid var(--border-light)

### 10.2 顶栏

- **高度**: 56px
- **背景**: var(--bg-primary)
- **边框**: 1px solid var(--border-light)

### 10.3 内容区域

- **内边距**: 16px
- **最大宽度**: 根据内容自适应
- **背景**: var(--bg-secondary)

---

## 11. 无障碍规范

### 11.1 对比度要求

- **正文文本**: 4.5:1 最小
- **大文本**: 3:1 最小
- **UI 组件**: 3:1 最小

### 11.2 焦点管理

- **可见焦点状态**: 2px outline
- **焦点顺序**: 匹配视觉顺序
- **键盘导航**: 支持 Tab 键导航

### 11.3 屏幕阅读器

- **语义化标签**: 使用正确的 HTML 标签
- **ARIA 标签**: 为交互元素添加标签
- **状态通知**: 使用 aria-live 区域

---

## 12. 性能优化

### 12.1 渲染性能

- **虚拟滚动**: 长列表使用虚拟滚动
- **懒加载**: 图片和组件懒加载
- **防抖节流**: 输入和滚动事件处理

### 12.2 动画性能

- **GPU 加速**: 使用 transform 和 opacity
- **避免重排**: 减少 layout 属性变化
- **requestAnimationFrame**: 使用 RAF 进行动画

---

## 13. 开发规范

### 13.1 CSS 规范

- **命名**: BEM 或 CSS Modules
- **变量**: 使用 CSS 自定义属性
- **单位**: 优先使用 rem, 响应式使用 vw/vh

### 13.2 组件规范

- **Props 类型**: 使用 TypeScript 定义
- **事件**: 使用 defineEmits
- **插槽**: 使用 defineSlots

### 13.3 代码风格

- **格式化**: Prettier
- **检查**: ESLint + Stylelint
- **提交**: Conventional Commits

---

## 14. 交付清单

### 视觉质量

- [ ] 无 emoji 作为图标 (使用 SVG)
- [ ] 图标风格一致 (outline/fill)
- [ ] 品牌资产正确使用
- [ ] 按压状态不改变布局
- [ ] 主题令牌一致使用

### 交互

- [ ] 所有可点击元素有按压反馈
- [ ] 触摸目标 >= 44px
- [ ] 微交互时间 150-300ms
- [ ] 禁用状态清晰可见
- [ ] 屏幕阅读器焦点顺序正确

### 明暗模式

- [ ] 主文本对比度 >= 4.5:1
- [ ] 次文本对比度 >= 3:1
- [ ] 边框和分隔线在两种模式下可见
- [ ] 模态框背景遮罩足够强 (40-60%)
- [ ] 两种主题都已测试

### 布局

- [ ] 安全区域被尊重
- [ ] 滚动内容不被固定元素遮挡
- [ ] 在不同设备尺寸下测试
- [ ] 水平间距根据设备调整
- [ ] 4/8px 间距节奏保持一致

### 无障碍

- [ ] 所有图像有替代文本
- [ ] 表单字段有标签和提示
- [ ] 颜色不是唯一指示器
- [ ] 支持减少动画偏好
- [ ] 支持动态字体大小

---

## 15. 参考资源

### 设计系统

- [Naive UI 文档](https://www.naiveui.com/)
- [Ionicons 图标](https://ionic.io/ionicons)

### 工具

- [Figma](https://figma.com/)
- [Storybook](https://storybook.js.org/)

### 规范

- [WCAG 2.1](https://www.w3.org/WAI/WCAG21/quickref/)
- [Material Design](https://m3.material.io/)
- [Apple Human Interface Guidelines](https://developer.apple.com/design/human-interface-guidelines/)

---

_最后更新: 2026-07-12_
_版本: 1.0.0_
