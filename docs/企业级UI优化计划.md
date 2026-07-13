# 企业级 UI/UX 优化计划

## 项目现状评估

**技术栈**: Vue 3 + TypeScript + Naive UI  
**当前状态**: 存在严重的企业级标准差距  
**优化目标**: 达到企业级通用管理平台的专业标准

---

## 问题严重程度分类

### 🔴 严重问题 (CRITICAL) - 必须立即修复

#### 1. 设计令牌系统失效

**问题**: 40+ 处硬编码颜色值完全绕过 `tokens.css`

**影响**:

- 深色模式无法正常工作
- 品牌色修改需要修改数十个文件
- 设计系统形同虚设

**具体位置**:

- `DashboardView.vue`: 15+ 处硬编码颜色
- `AdminView.vue`: 10+ 处硬编码颜色
- `WorkspaceView.vue`: 8+ 处硬编码颜色
- `AppRoot.vue`: 5+ 处硬编码颜色
- `HomeView.vue`: 3+ 处硬编码颜色

**修复方案**:

```css
/* ❌ 错误 */
color="#2080f0"
background: #fee

/* ✅ 正确 */
color="var(--color-primary)"
background: var(--color-error-light)
```

---

#### 2. 设计系统冲突

**问题**: `style.css` 和 `tokens.css` 定义了两套并行且冲突的变量

**冲突变量**:
| 用途 | style.css | tokens.css |
|------|-----------|------------|
| 文本色 | `--text` | `--text-secondary` |
| 标题色 | `--text-h` | `--text-primary` |
| 背景色 | `--bg` | `--bg-primary` |
| 边框色 | `--border` | `--border-light` |
| 字体栈 | `--sans` | `--font-sans` |

**修复方案**:

1. 统一使用 `tokens.css` 作为唯一设计令牌源
2. 将 `style.css` 中的变量迁移或移除
3. 更新所有引用旧变量的组件

---

#### 3. Naive UI 主题色彩不一致

**问题**: Naive UI 主题使用绿色系，而 tokens.css 使用蓝色系

**当前状态**:

- Naive UI: `primaryColor: '#18a058'` (绿色)
- tokens.css: `--color-primary: #2080f0` (蓝色)

**修复方案**:

1. 统一使用蓝色系作为主色调
2. 更新 `src/core/theme/index.ts` 中的主题配置
3. 确保所有组件使用一致的色彩系统

---

### 🟠 高严重度问题 (HIGH) - 短期内修复

#### 4. 缺失响应式设计

**问题**: 管理后台完全没有断点处理

**受影响组件**:

- `AdminLayout.vue` - 侧边栏宽度固定
- `DashboardView.vue` - 统计卡片固定 4 列
- `AdminView.vue` - 统计卡片固定 4 列
- `WorkspaceView.vue` - 统计卡片固定 4 列
- `ProTable.vue` - 表格无响应式处理
- `ProForm.vue` - 表单布局固定

**修复方案**:

```css
/* 添加响应式断点 */
@media (max-width: 1024px) {
  .stat-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 768px) {
  .stat-grid {
    grid-template-columns: 1fr;
  }

  .sidebar {
    display: none; /* 移动端隐藏侧边栏 */
  }
}
```

---

#### 5. 无障碍访问性缺陷

**问题清单**:

**(a) HTML 语言设置错误**

```html
<!-- ❌ 错误 -->
<html lang="en">
  <!-- ✅ 正确 -->
  <html lang="zh-CN"></html>
</html>
```

**(b) 缺少 ARIA 属性的交互元素**

- 暗色模式切换按钮: 缺少 `aria-label`, `aria-pressed`
- 侧边栏折叠按钮: 缺少 `aria-label`, `aria-expanded`
- 设置按钮: 缺少 `aria-label`
- 侧边栏容器: 缺少 `role="navigation"`, `aria-label`
- 用户菜单: 缺少 `aria-haspopup`, `aria-expanded`

**(c) 焦点管理缺陷**

- 缺少 skip-to-content 链接
- Modal 弹窗没有焦点陷阱
- 弹窗关闭后焦点没有返回触发元素

**(d) 颜色对比度问题**

- `--text-tertiary: #9ca3af` 对比度约 2.96:1 (不满足 WCAG AA 4.5:1)
- `--text-disabled: #c0c4cc` 对比度更低

---

#### 6. 深色模式实现不完整

**问题**: 手动切换深色模式时 tokens.css 变量不生效

**原因**:

- `tokens.css` 使用 `@media (prefers-color-scheme: dark)` 响应系统偏好
- `useTheme.ts` 使用 `document.documentElement.classList.toggle('dark')` 切换类名
- 两者机制不兼容

**修复方案**:

1. 将深色模式变量改为基于类名的选择器
2. 或者修改 useTheme.ts 使用系统偏好而非类名切换

```css
/* 修改为基于类名 */
.dark {
  --bg-primary: #16171d;
  --text-primary: #f3f4f6;
  /* ... */
}
```

---

### 🟡 中等严重度问题 (MEDIUM) - 中期改进

#### 7. 过度使用内联样式

**问题**: 63 处内联样式，布局和间距都通过内联 style 实现

**典型示例**:

```vue
<!-- ❌ 错误 -->
<div style="display: flex; align-items: center; gap: 8px">

<!-- ✅ 正确 -->
<div class="flex items-center gap-2">
```

**修复方案**:

1. 创建 CSS 工具类
2. 使用 scoped styles
3. 提取可复用的组件

---

#### 8. 间距系统不一致

**问题**: 混用多种间距方式

**当前状态**:

- 内联硬编码: `gap: 12px`, `gap: 8px`, `gap: 16px`
- Naive UI prop: `:size="16"`, `:size="12"`, `:size="8"`
- 未使用 tokens.css 的 `--space-*` 变量

**修复方案**:

1. 统一使用 `--space-*` 变量
2. 创建间距工具类
3. 更新所有组件使用一致的间距

---

#### 9. 交互状态不完整

**问题**: 按钮和交互元素缺少完整状态样式

**缺失状态**:

- `:hover` - 悬停状态
- `:active` - 点击状态
- `:focus-visible` - 键盘焦点状态
- `:disabled` - 禁用状态

**修复方案**:

```css
.button {
  transition: all 150ms ease-out;
}

.button:hover {
  background: var(--color-primary-hover);
}

.button:active {
  transform: scale(0.98);
}

.button:focus-visible {
  outline: 2px solid var(--color-primary);
  outline-offset: 2px;
}

.button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
```

---

### 🟢 低严重度问题 (LOW) - 长期优化

#### 10. HTML 语义化不足

**问题**:

- 缺少 `<nav>` 元素标记导航区域
- 错误页面缺少描述性文本
- 外部链接缺少 `rel="noopener noreferrer"`

---

#### 11. 硬编码 z-index 值

**问题**: 未使用 tokens.css 中的 z-index 系统

**修复方案**:

```css
/* ❌ 错误 */
z-index: 999

/* ✅ 正确 */
z-index: var(--z-modal)
```

---

#### 12. 字体单位问题

**问题**: 使用 `px` 而非相对单位

**修复方案**:

```css
/* ❌ 错误 */
font-size: 16px;

/* ✅ 正确 */
font-size: 1rem;
```

---

## 企业级设计系统推荐

### 颜色系统

**主色调**: 专业蓝 (#2563EB)

- 传达信任、专业、稳定
- 适合企业级应用
- 良好的无障碍支持

**辅助色**:

- 成功: #059669 (绿色)
- 警告: #D97706 (橙色)
- 错误: #DC2626 (红色)
- 信息: #2563EB (蓝色)

### 字体系统

**推荐字体**: Plus Jakarta Sans

- 企业级 SaaS 应用首选
- 现代、易读、专业
- 支持多种字重

### 间距系统

**基准单位**: 4px
**间距刻度**: 4, 8, 12, 16, 20, 24, 32, 40, 48, 64, 80, 96px

### 响应式断点

- 移动端: 375px
- 平板端: 768px
- 桌面端: 1024px
- 大桌面: 1440px

---

## 修复优先级

### 第一阶段 (立即 - 1 周)

1. ✅ 统一颜色系统
   - 移除所有硬编码颜色
   - 统一使用 tokens.css 变量
   - 修复 Naive UI 主题配置

2. ✅ 合并设计系统
   - 整合 style.css 和 tokens.css
   - 统一变量命名规范

3. ✅ 修复深色模式
   - 实现基于类名的深色模式切换
   - 确保所有组件支持深色模式

### 第二阶段 (短期 - 2-3 周)

4. ✅ 添加响应式设计
   - 为管理后台添加断点处理
   - 优化移动端布局

5. ✅ 修复无障碍问题
   - 更新 HTML lang 属性
   - 添加 ARIA 属性
   - 实现焦点管理

6. ✅ 统一间距系统
   - 使用 --space-\* 变量
   - 创建间距工具类

### 第三阶段 (中期 - 1-2 月)

7. ✅ 优化内联样式
   - 迁移为 CSS 类
   - 创建可复用组件

8. ✅ 完善交互状态
   - 添加完整的状态样式
   - 优化动画过渡

9. ✅ 优化语义化 HTML
   - 使用语义化标签
   - 添加 skip navigation

---

## 企业级 UI 检查清单

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

## 相关资源

### 设计系统

- [Naive UI 文档](https://www.naiveui.com/)
- [Ionicons 图标](https://ionic.io/ionicons)

### 规范

- [WCAG 2.1](https://www.w3.org/WAI/WCAG21/quickref/)
- [Material Design 3](https://m3.material.io/)
- [Apple Human Interface Guidelines](https://developer.apple.com/design/human-interface-guidelines/)

### 工具

- [Contrast Checker](https://webaim.org/resources/contrastchecker/)
- [Color Oracle](https://colororacle.org/)
- [WAVE](https://wave.webaim.org/)

---

_最后更新: 2026-07-12_  
_版本: 1.0.0_
