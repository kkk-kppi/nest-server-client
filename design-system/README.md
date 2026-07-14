# UI/UX Pro Max 设计系统使用指南

## 概述

本项目已集成 UI/UX Pro Max 设计系统，为 Nest Server Client 项目提供统一的设计语言和组件规范。

## 设计系统文件结构

```
design-system/
├── nest-server-client/
│   ├── MASTER.md          # 主设计系统文件（全局规则）
│   └── pages/             # 页面特定覆盖（按需创建）
└── README.md              # 本使用指南

src/styles/
├── tokens.css             # 项目设计令牌（已集成设计系统）
├── design-system-tokens.css  # 设计系统专用令牌
└── utilities.css          # 工具类
```

## 设计系统令牌

### 颜色系统

设计系统使用以下颜色变量：

| 用途        | CSS 变量                 | 颜色值             |
| ----------- | ------------------------ | ------------------ |
| 主色        | `--ds-color-primary`     | `#0D9488` (青绿色) |
| 辅助色      | `--ds-color-secondary`   | `#14B8A6`          |
| 强调色/CTA  | `--ds-color-accent`      | `#EA580C` (橙色)   |
| 背景色      | `--ds-color-background`  | `#F0FDFA`          |
| 前景色/文本 | `--ds-color-foreground`  | `#134E4A`          |
| 破坏性/错误 | `--ds-color-destructive` | `#DC2626`          |

### 字体系统

使用 Plus Jakarta Sans 字体：

```css
font-family: var(--ds-font-sans);
```

### 间距系统

使用以下间距变量：

```css
--ds-space-xs: 4px;
--ds-space-sm: 8px;
--ds-space-md: 16px;
--ds-space-lg: 24px;
--ds-space-xl: 32px;
--ds-space-2xl: 48px;
--ds-space-3xl: 64px;
```

## 组件使用

### 按钮

```html
<!-- 主要按钮 -->
<button class="ds-btn ds-btn-primary">主要操作</button>

<!-- 次要按钮 -->
<button class="ds-btn ds-btn-secondary">次要操作</button>

<!-- 危险按钮 -->
<button class="ds-btn ds-btn-destructive">删除</button>
```

### 卡片

```html
<div class="ds-card">
  <h3>卡片标题</h3>
  <p>卡片内容</p>
</div>
```

### 输入框

```html
<input type="text" class="ds-input" placeholder="请输入..." />
```

### 标签

```html
<span class="ds-badge ds-badge-primary">主要</span>
<span class="ds-badge ds-badge-secondary">次要</span>
<span class="ds-badge ds-badge-accent">强调</span>
<span class="ds-badge ds-badge-destructive">错误</span>
```

## 工具类

### 颜色工具类

```html
<div class="ds-bg-primary">主要背景</div>
<div class="ds-text-accent">强调文本</div>
<div class="ds-border-destructive">错误边框</div>
```

### 间距工具类

```html
<div class="ds-p-md">16px 内边距</div>
<div class="ds-m-lg">24px 外边距</div>
```

### 阴影工具类

```html
<div class="ds-shadow-md">中等阴影</div>
<div class="ds-shadow-lg">大阴影</div>
```

### 圆角工具类

```html
<div class="ds-rounded-lg">大圆角</div>
<div class="ds-rounded-full">全圆角</div>
```

### 过渡工具类

```html
<div class="ds-transition-normal">正常过渡</div>
<div class="ds-transition-fast">快速过渡</div>
```

## 深色模式

设计系统支持深色模式。在根元素添加 `dark` 类即可启用：

```html
<html class="dark">
  <!-- 深色模式内容 -->
</html>
```

深色模式会自动调整所有颜色变量，确保良好的对比度和可读性。

## 响应式设计

设计系统遵循以下响应式断点：

- `sm`: 640px
- `md`: 768px
- `lg`: 1024px
- `xl`: 1280px
- `2xl`: 1536px

## 无障碍访问

设计系统遵循 WCAG 无障碍访问标准：

- 所有交互元素都有明确的焦点状态
- 颜色对比度符合 4.5:1 标准
- 支持键盘导航
- 尊重用户的动画偏好设置

## 最佳实践

### 颜色使用

1. 使用语义化颜色变量，而不是直接使用十六进制值
2. 确保文本和背景之间有足够的对比度
3. 在深色模式下测试所有颜色组合

### 间距使用

1. 使用设计系统提供的间距变量，保持一致性
2. 遵循 4px/8px 网格系统
3. 使用适当的间距创建视觉层次

### 组件使用

1. 优先使用设计系统提供的组件样式
2. 保持组件样式的一致性
3. 遵循设计系统的命名约定

### 动画使用

1. 使用设计系统提供的过渡时间
2. 遵循缓动函数规范
3. 尊重用户的 `prefers-reduced-motion` 设置

## 更新设计系统

如需更新设计系统，请使用以下命令：

```bash
# 重新生成设计系统
python .opencode\skills\ui-ux-pro-max\scripts\search.py "enterprise SaaS productivity dashboard" --design-system --persist -p "Nest Server Client"

# 更新特定页面设计系统
python .opencode\skills\ui-ux-pro-max\scripts\search.py "enterprise SaaS productivity dashboard" --design-system --persist -p "Nest Server Client" --page "dashboard"
```

## 故障排除

### 字体未加载

确保网络连接正常，Google Fonts CDN 可访问。

### 颜色未生效

检查是否正确导入了 `design-system-tokens.css` 文件。

### 深色模式不工作

确保在根元素上添加了 `dark` 类，并且 CSS 变量正确定义。

## 参考资源

- [UI/UX Pro Max 设计系统文档](design-system/nest-server-client/MASTER.md)
- [项目设计令牌](src/styles/tokens.css)
- [设计系统令牌](src/styles/design-system-tokens.css)
