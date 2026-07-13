# P2 业务开发黄金路径 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 消除当前项目在表格表单、权限控制、CRUD 示例和国际化方面的缺陷，将项目提升为可复制的企业级前端启动模板。

**Architecture:** 整改遵循"组件可靠性先于业务功能、权限控制先于 CRUD 集成、单一事实源先于功能扩展"的顺序。P2 拆分为五个可独立交付的任务：ProTable 泛型化、ProForm 校验闭环、操作级权限、用户管理黄金路径、国际化与响应式。

**Tech Stack:** Vue 3、TypeScript、Naive UI、Pinia、Vitest、Vue Test Utils、Playwright、MSW。

---

## 1. 当前状态分析

### 1.1 ProTable 问题

- 使用 `Record<string, unknown>` 作为行数据类型，业务页面需要强制断言
- 错误被 `console.error` 吞掉，用户看不到错误状态
- 没有 stale 数据标记，快速翻页时旧数据可能覆盖新数据
- 没有 retry 机制，初次加载失败后只能刷新页面
- `pagination=false` 时仍显示分页器

### 1.2 ProForm 问题

- 没有暴露 `validate/reset/restoreValidation` 方法
- `required: true` 不会自动生成校验规则
- `field.props` 没有传递给控件
- 没有服务端字段错误回显能力
- 缺少统一的 mutation 状态管理

### 1.3 权限问题

- 只有 `canAccess` 函数，没有 composable 封装
- 没有 `AccessControl` 组件，业务页面散落 `v-if="permissions.includes(...)"`
- 没有统一的操作权限常量定义

### 1.4 用户管理问题

- 使用原始 NForm 而不是 ProForm
- 没有表单校验就直接提交
- 没有权限控制，所有用户都能看到所有操作
- 没有 i18n，硬编码中文
- 没有错误处理和 loading 状态反馈

### 1.5 国际化与响应式问题

- 硬编码中文文案，没有翻译 key
- 没有语言切换组件
- 主题没有统一事实源
- 移动端没有响应式适配

---

## 2. 实施原则

1. 每个缺陷先写能复现真实行为的失败测试，再修改实现
2. 不使用 `any`、`as unknown as`、`@ts-ignore` 绕过类型问题
3. 组件 API 必须向后兼容，避免破坏现有业务页面
4. 前端权限只控制交互体验，后端 API 必须独立完成授权
5. 每个阶段完成后运行对应专项测试和完整质量门禁

---

## 3. Task 13: 将 ProTable 改造成可靠的泛型表格

**Files:**

- Modify: `src/shared/components/pro/ProTable.vue`
- Create: `src/shared/components/pro/ProTable.test.ts`
- Modify: `src/shared/components/pro/ProTable.stories.ts`

### Step 1: 编写 ProTable 行为测试

覆盖初始请求、分页、page size、搜索回第一页、重置、refresh、`pagination=false`、错误态和重试。

```ts
// src/shared/components/pro/ProTable.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { NConfigProvider } from 'naive-ui'
import ProTable from './ProTable.vue'

function createWrapper(props = {}) {
  return mount(ProTable, {
    props: {
      columns: [{ title: 'Name', key: 'name' }],
      request: vi.fn().mockResolvedValue({ items: [{ id: 1, name: 'Test' }], total: 1 }),
      ...props,
    },
    global: {
      components: { NConfigProvider },
    },
  })
}

describe('ProTable', () => {
  it('calls request on mount', async () => {
    const request = vi.fn().mockResolvedValue({ items: [], total: 0 })
    createWrapper({ request })
    await vi.waitFor(() => {
      expect(request).toHaveBeenCalledWith(expect.objectContaining({ page: 1, pageSize: 10 }))
    })
  })

  it('resets to page 1 on search', async () => {
    const request = vi.fn().mockResolvedValue({ items: [], total: 0 })
    const wrapper = createWrapper({
      request,
      searchFields: [{ key: 'name', label: 'Name' }],
    })
    // Navigate to page 2 first
    await wrapper.vm.$nextTick()
    // Then search
    await wrapper.find('button').trigger('click')
    await vi.waitFor(() => {
      expect(request).toHaveBeenCalledWith(expect.objectContaining({ page: 1 }))
    })
  })

  it('shows error state on request failure', async () => {
    const request = vi.fn().mockRejectedValue(new Error('Network error'))
    const wrapper = createWrapper({ request })
    await vi.waitFor(() => {
      expect(wrapper.find('.n-result--error').exists()).toBe(true)
    })
  })

  it('retries on retry button click', async () => {
    const request = vi
      .fn()
      .mockRejectedValueOnce(new Error('Network error'))
      .mockResolvedValue({ items: [{ id: 1, name: 'Test' }], total: 1 })
    const wrapper = createWrapper({ request })
    await vi.waitFor(() => {
      expect(wrapper.find('.n-result--error').exists()).toBe(true)
    })
    await wrapper.find('[data-testid="retry-button"]').trigger('click')
    await vi.waitFor(() => {
      expect(request).toHaveBeenCalledTimes(2)
    })
  })

  it('does not show pagination when pagination=false', async () => {
    const request = vi.fn().mockResolvedValue({ items: [], total: 0 })
    const wrapper = createWrapper({ request, pagination: false })
    await vi.waitFor(() => {
      expect(wrapper.find('.n-pagination').exists()).toBe(false)
    })
  })
})
```

### Step 2: 编写旧响应覆盖测试

先发 A 再发 B，B 先返回，最终表格必须保留 B。

```ts
it('keeps latest response when earlier request resolves later', async () => {
  let resolveA: (value: unknown) => void
  let resolveB: (value: unknown) => void

  const request = vi
    .fn()
    .mockImplementationOnce(
      () =>
        new Promise((r) => {
          resolveA = r
        }),
    )
    .mockImplementationOnce(
      () =>
        new Promise((r) => {
          resolveB = r
        }),
    )

  const wrapper = createWrapper({ request })

  // Trigger second request
  await wrapper.vm.refresh()

  // Resolve B first
  resolveB!({ items: [{ id: 2, name: 'B' }], total: 1 })
  // Then resolve A
  resolveA!({ items: [{ id: 1, name: 'A' }], total: 1 })

  await vi.waitFor(() => {
    expect(wrapper.text()).toContain('B')
    expect(wrapper.text()).not.toContain('A')
  })
})
```

### Step 3: 实现泛型 Row 和 Query

业务页面不再使用 `Record<string, unknown>` 和行数据强制断言。

```vue
<script
  setup
  lang="ts"
  generic="
    TRow extends Record<string, unknown>,
    TQuery extends Record<string, unknown> = Record<string, unknown>
  "
>
import { ref, computed, onMounted, watch } from 'vue'
import {
  NDataTable,
  NCard,
  NSpace,
  NButton,
  NIcon,
  NTooltip,
  NInput,
  NSelect,
  NResult,
} from 'naive-ui'
import { RefreshOutline, ExpandOutline, ContractOutline } from '@vicons/ionicons5'
import type { DataTableColumns, PaginationProps, SelectOption } from 'naive-ui'

interface SearchField {
  key: string
  label: string
  type?: 'input' | 'select'
  options?: SelectOption[]
}

interface RequestParams extends TQuery {
  page: number
  pageSize: number
}

interface RequestResult {
  items: TRow[]
  total: number
}

interface Props {
  columns: DataTableColumns<TRow>
  request: (params: RequestParams) => Promise<RequestResult>
  searchFields?: SearchField[]
  pagination?: boolean
  pageSize?: number
  rowKey?: string
  toolbar?: boolean
  title?: string
}

const props = withDefaults(defineProps<Props>(), {
  searchFields: () => [],
  pagination: true,
  pageSize: 10,
  rowKey: 'id',
  toolbar: true,
  title: '',
})

const emit = defineEmits<{
  search: [values: TQuery]
  reset: []
  add: []
}>()

const loading = ref(false)
const tableData = ref<TRow[]>([])
const total = ref(0)
const searchValues = ref<Partial<TQuery>>({})
const currentPage = ref(1)
const currentPageSize = ref(props.pageSize)
const isFullscreen = ref(false)
const error = ref<Error | null>(null)
const requestId = ref(0)

// ... rest of implementation
</script>
```

### Step 4: 增加 error/stale 状态

初次失败显示错误面板；保留旧数据时明确标记 stale；分页失败时保证页码与数据一致。

```vue
<template>
  <n-card
    :title="title"
    :bordered="false"
    :style="isFullscreen ? 'position: fixed; inset: 0; z-index: 999; overflow: auto;' : ''"
  >
    <!-- Search fields -->
    <div v-if="searchFields.length" style="margin-bottom: 16px">
      <!-- ... existing search UI ... -->
    </div>

    <!-- Toolbar -->
    <div
      v-if="toolbar"
      style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px"
    >
      <n-space>
        <slot name="toolbar" />
      </n-space>
      <n-space>
        <!-- ... existing toolbar buttons ... -->
      </n-space>
    </div>

    <!-- Error state -->
    <n-result
      v-if="error && !tableData.length"
      status="error"
      title="加载失败"
      :description="error.message"
    >
      <template #footer>
        <n-button data-testid="retry-button" @click="handleRetry"> 重试 </n-button>
      </template>
    </n-result>

    <!-- Table -->
    <n-data-table
      v-else
      :columns="columns"
      :data="tableData"
      :loading="loading"
      :pagination="props.pagination ? tablePagination : false"
      :row-key="getRowKeyValue"
      :bordered="false"
      striped
    />

    <slot name="extra" />
  </n-card>
</template>
```

### Step 5: 修复组件契约和可访问性

`pagination=false` 生效；图标按钮提供 `aria-label`；全屏支持 Escape、焦点恢复和 `aria-pressed`。

```vue
<template>
  <!-- Refresh button -->
  <n-tooltip trigger="hover">
    <template #trigger>
      <n-button quaternary circle aria-label="刷新数据" @click="handleRefresh">
        <template #icon>
          <n-icon><RefreshOutline /></n-icon>
        </template>
      </n-button>
    </template>
    刷新
  </n-tooltip>

  <!-- Fullscreen button -->
  <n-tooltip trigger="hover">
    <template #trigger>
      <n-button
        quaternary
        circle
        :aria-pressed="isFullscreen"
        :aria-label="isFullscreen ? '退出全屏' : '进入全屏'"
        @click="toggleFullscreen"
      >
        <template #icon>
          <n-icon>
            <ContractOutline v-if="isFullscreen" />
            <ExpandOutline v-else />
          </n-icon>
        </template>
      </n-button>
    </template>
    {{ isFullscreen ? '退出全屏' : '全屏' }}
  </n-tooltip>
</template>
```

### Step 6: 运行测试和 Storybook 构建

Run: `pnpm exec vitest run src/shared/components/pro/ProTable.test.ts`

Run: `pnpm build-storybook`

Expected: PASS。

### Step 7: 提交独立变更

```bash
git add src/shared/components/pro/ProTable.vue src/shared/components/pro/ProTable.test.ts src/shared/components/pro/ProTable.stories.ts
git commit -m "feat: make ProTable typed and race safe"
```

---

## 4. Task 14: 完成 ProForm 校验与提交闭环

**Files:**

- Modify: `src/shared/components/pro/ProForm.vue`
- Create: `src/shared/components/pro/ProForm.test.ts`
- Modify: `src/shared/components/pro/ProForm.stories.ts`
- Create: `src/shared/composables/useMutation.ts`
- Create: `src/shared/composables/useMutation.test.ts`

### Step 1: 编写字段更新测试

覆盖 input、textarea、number、select、switch、radio、checkbox、date 和 time，并断言更新一个字段保留其他字段。

```ts
// src/shared/components/pro/ProForm.test.ts
import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { NConfigProvider } from 'naive-ui'
import ProForm from './ProForm.vue'

function createWrapper(props = {}) {
  return mount(ProForm, {
    props: {
      fields: [
        { key: 'name', label: 'Name', type: 'input' },
        { key: 'age', label: 'Age', type: 'number' },
        {
          key: 'status',
          label: 'Status',
          type: 'select',
          options: [{ label: 'Active', value: '0' }],
        },
      ],
      model: { name: 'Test', age: 25, status: '0' },
      'onUpdate:model': vi.fn(),
      ...props,
    },
    global: {
      components: { NConfigProvider },
    },
  })
}

describe('ProForm', () => {
  it('updates field value while preserving others', async () => {
    const onUpdate = vi.fn()
    const wrapper = createWrapper({ 'onUpdate:model': onUpdate })

    await wrapper.find('input').setValue('New Name')

    expect(onUpdate).toHaveBeenCalledWith({
      name: 'New Name',
      age: 25,
      status: '0',
    })
  })

  it('generates required rules from field config', () => {
    const wrapper = createWrapper({
      fields: [{ key: 'name', label: 'Name', type: 'input', required: true }],
    })

    const form = wrapper.findComponent({ name: 'NForm' })
    expect(form.props('rules')).toEqual({
      name: [{ required: true, message: '请输入Name', trigger: ['input', 'blur'] }],
    })
  })

  it('exposes validate method', async () => {
    const wrapper = createWrapper()

    expect(wrapper.vm.validate).toBeTypeOf('function')
  })

  it('exposes reset method', async () => {
    const wrapper = createWrapper()

    expect(wrapper.vm.reset).toBeTypeOf('function')
  })
})
```

### Step 2: 编写 required、props 和 validate 测试

`required: true` 必须产生实际规则；`field.props` 必须传给控件；暴露 `validate/reset/restoreValidation`。

```ts
it('passes field.props to control component', () => {
  const wrapper = createWrapper({
    fields: [
      {
        key: 'name',
        label: 'Name',
        type: 'input',
        props: { maxlength: 10, showCount: true },
      },
    ],
    model: { name: '' },
  })

  const input = wrapper.findComponent({ name: 'NInput' })
  expect(input.props('maxlength')).toBe(10)
  expect(input.props('showCount')).toBe(true)
})

it('validates required fields', async () => {
  const wrapper = createWrapper({
    fields: [{ key: 'name', label: 'Name', type: 'input', required: true }],
    model: { name: '' },
  })

  await expect(wrapper.vm.validate()).rejects.toThrow()
})
```

### Step 3: 实现 FormInst 暴露和字段扩展点

增加字段插槽或 render 扩展点，避免业务遇到非标准控件就绕过 ProForm。

```vue
<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import type { FormInst, FormRules } from 'naive-ui'

const formRef = ref<FormInst | null>(null)

const autoRules = computed<FormRules>(() => {
  const rules: FormRules = {}
  for (const field of props.fields) {
    if (field.required) {
      rules[field.key] = {
        required: true,
        message: `请输入${field.label}`,
        trigger: ['input', 'blur'],
      }
    }
  }
  return rules
})

const mergedRules = computed<FormRules>(() => ({
  ...autoRules.value,
  ...props.rules,
}))

async function validate() {
  if (!formRef.value) return
  return formRef.value.validate()
}

function reset() {
  if (!formRef.value) return
  formRef.value.restoreValidation()
}

function restoreValidation() {
  if (!formRef.value) return
  formRef.value.restoreValidation()
}

defineExpose({
  validate,
  reset,
  restoreValidation,
})
</script>

<template>
  <n-form
    ref="formRef"
    :model="model"
    :rules="mergedRules"
    :label-width="labelWidth"
    :label-placement="labelPlacement"
  >
    <n-grid :cols="cols" :x-gap="16">
      <n-gi v-for="field in fields" :key="field.key" :span="field.span || 1">
        <n-form-item :label="field.label" :path="field.key">
          <!-- Custom slot -->
          <slot
            v-if="$slots[`field-${field.key}`]"
            :name="`field-${field.key}`"
            :field="field"
            :model="model"
          />

          <!-- Input -->
          <n-input
            v-else-if="!field.type || field.type === 'input'"
            :value="getStringValue(field.key)"
            :placeholder="field.placeholder || `请输入${field.label}`"
            :disabled="field.disabled || disabled"
            v-bind="field.props"
            @update:value="updateField(field.key, $event)"
          />

          <!-- ... other field types ... -->
        </n-form-item>
      </n-gi>
    </n-grid>
    <slot name="action" />
  </n-form>
</template>
```

### Step 4: 实现 useMutation

统一提供 `idle/loading/success/error`、重复提交保护、成功通知、业务错误通知和 telemetry hook。

```ts
// src/shared/composables/useMutation.ts
import { ref, computed } from 'vue'

export type MutationStatus = 'idle' | 'loading' | 'success' | 'error'

interface UseMutationOptions<TData, TVariables> {
  mutationFn: (variables: TVariables) => Promise<TData>
  onSuccess?: (data: TData, variables: TVariables) => void
  onError?: (error: Error, variables: TVariables) => void
  onSettled?: (data: TData | null, error: Error | null, variables: TVariables) => void
}

export function useMutation<TData, TVariables = void>(
  options: UseMutationOptions<TData, TVariables>,
) {
  const status = ref<MutationStatus>('idle')
  const data = ref<TData | null>(null)
  const error = ref<Error | null>(null)
  const isLoading = computed(() => status.value === 'loading')
  const isError = computed(() => status.value === 'error')
  const isSuccess = computed(() => status.value === 'success')

  let mutationId = 0

  async function mutate(variables: TVariables) {
    const id = ++mutationId

    status.value = 'loading'
    error.value = null

    try {
      const result = await options.mutationFn(variables)

      if (id !== mutationId) return result

      data.value = result
      status.value = 'success'
      options.onSuccess?.(result, variables)
      options.onSettled?.(result, null, variables)

      return result
    } catch (err) {
      if (id !== mutationId) return null

      const errorObj = err instanceof Error ? err : new Error(String(err))
      error.value = errorObj
      status.value = 'error'
      options.onError?.(errorObj, variables)
      options.onSettled?.(null, errorObj, variables)

      return null
    }
  }

  function reset() {
    status.value = 'idle'
    data.value = null
    error.value = null
    mutationId++
  }

  return {
    mutate,
    reset,
    status,
    data,
    error,
    isLoading,
    isError,
    isSuccess,
  }
}
```

### Step 5: 运行测试和 Storybook 构建

Run: `pnpm exec vitest run src/shared/components/pro/ProForm.test.ts src/shared/composables/useMutation.test.ts`

Run: `pnpm build-storybook`

Expected: PASS。

### Step 6: 提交独立变更

```bash
git add src/shared/components/pro/ProForm.vue src/shared/components/pro/ProForm.test.ts src/shared/components/pro/ProForm.stories.ts src/shared/composables/useMutation.ts src/shared/composables/useMutation.test.ts
git commit -m "feat: complete ProForm validation workflow"
```

---

## 5. Task 15: 增加操作级权限能力

**Files:**

- Create: `src/features/auth/usePermission.ts`
- Create: `src/features/auth/usePermission.test.ts`
- Create: `src/features/auth/components/AccessControl.vue`
- Create: `src/features/auth/components/AccessControl.test.ts`
- Modify: `src/features/auth/permission.ts`
- Modify: `src/features/auth/index.ts`

### Step 1: 锁定权限组合语义

测试 roles 是任一匹配，permissions 是全部匹配，空要求放行，额外权限不影响结果。

```ts
// src/features/auth/usePermission.test.ts
import { describe, it, expect, vi } from 'vitest'
import { usePermission } from './usePermission'
import { setActivePinia, createPinia } from 'pinia'

vi.mock('./store/useAuthStore', () => ({
  useAuthStore: vi.fn(() => ({
    roles: ['admin'],
    permissions: ['system:user:read', 'system:user:create', 'system:user:update'],
  })),
}))

describe('usePermission', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('returns true when roles match any', () => {
    const { hasRole } = usePermission()
    expect(hasRole(['admin', 'viewer'])).toBe(true)
  })

  it('returns false when no roles match', () => {
    const { hasRole } = usePermission()
    expect(hasRole(['editor'])).toBe(false)
  })

  it('returns true when all permissions match', () => {
    const { hasPermission } = usePermission()
    expect(hasPermission(['system:user:read', 'system:user:create'])).toBe(true)
  })

  it('returns false when some permissions missing', () => {
    const { hasPermission } = usePermission()
    expect(hasPermission(['system:user:read', 'system:user:delete'])).toBe(false)
  })

  it('returns true for empty requirements', () => {
    const { canAccess } = usePermission()
    expect(canAccess({})).toBe(true)
  })

  it('returns true for undefined meta', () => {
    const { canAccess } = usePermission()
    expect(canAccess(undefined)).toBe(true)
  })
})
```

### Step 2: 实现 composable 和组件

页面通过统一 API 判断 `read/create/update/delete/export`，禁止散落 `includes()`。

```ts
// src/features/auth/usePermission.ts
import { computed } from 'vue'
import { useAuthStore } from './store/useAuthStore'
import type { UserRole } from './store/useAuthStore'
import { canAccess } from './permission'
import type { AccessMeta } from './permission'

export function usePermission() {
  const authStore = useAuthStore()

  const roles = computed(() => authStore.roles)
  const permissions = computed(() => authStore.permissions)

  function hasRole(requiredRoles: UserRole[]): boolean {
    return requiredRoles.some((role) => roles.value.includes(role))
  }

  function hasPermission(requiredPermissions: string[]): boolean {
    return requiredPermissions.every((perm) => permissions.value.includes(perm))
  }

  function canAccessMeta(meta: AccessMeta | undefined): boolean {
    return canAccess(roles.value, permissions.value, meta)
  }

  // Common permission checks
  const canReadSystem = computed(() => hasPermission(['system:user:read']))
  const canCreateSystem = computed(() => hasPermission(['system:user:create']))
  const canUpdateSystem = computed(() => hasPermission(['system:user:update']))
  const canDeleteSystem = computed(() => hasPermission(['system:user:delete']))

  return {
    roles,
    permissions,
    hasRole,
    hasPermission,
    canAccess: canAccessMeta,
    canReadSystem,
    canCreateSystem,
    canUpdateSystem,
    canDeleteSystem,
  }
}
```

### Step 3: 为禁用和隐藏模式编写组件测试

`AccessControl` 支持隐藏内容或展示 disabled fallback；默认不渲染无权限操作。

```vue
<!-- src/features/auth/components/AccessControl.vue -->
<script setup lang="ts">
import { computed } from 'vue'
import { usePermission } from '../usePermission'
import type { UserRole } from '../store/useAuthStore'

interface Props {
  roles?: UserRole[]
  permissions?: string[]
  mode?: 'hide' | 'disabled'
}

const props = withDefaults(defineProps<Props>(), {
  roles: () => [],
  permissions: () => [],
  mode: 'hide',
})

const { hasRole, hasPermission } = usePermission()

const hasAccess = computed(() => {
  const rolePass = !props.roles.length || hasRole(props.roles)
  const permissionPass = !props.permissions.length || hasPermission(props.permissions)
  return rolePass && permissionPass
})
</script>

<template>
  <template v-if="mode === 'hide'">
    <slot v-if="hasAccess" />
  </template>
  <template v-else>
    <div :class="{ 'access-disabled': !hasAccess }" :aria-disabled="!hasAccess">
      <slot :has-access="hasAccess" />
    </div>
  </template>
</template>

<style scoped>
.access-disabled {
  opacity: 0.5;
  pointer-events: none;
}
</style>
```

```ts
// src/features/auth/components/AccessControl.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import AccessControl from './AccessControl.vue'
import { setActivePinia, createPinia } from 'pinia'

vi.mock('../usePermission', () => ({
  usePermission: vi.fn(() => ({
    hasRole: vi.fn((roles: string[]) => roles.includes('admin')),
    hasPermission: vi.fn((perms: string[]) => perms.includes('system:user:read')),
  })),
}))

describe('AccessControl', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('hides content when no access in hide mode', () => {
    const wrapper = mount(AccessControl, {
      props: { roles: ['editor'], mode: 'hide' },
      slots: { default: '<div>Secret Content</div>' },
    })

    expect(wrapper.text()).not.toContain('Secret Content')
  })

  it('shows content when has access in hide mode', () => {
    const wrapper = mount(AccessControl, {
      props: { roles: ['admin'], mode: 'hide' },
      slots: { default: '<div>Secret Content</div>' },
    })

    expect(wrapper.text()).toContain('Secret Content')
  })

  it('disables content when no access in disabled mode', () => {
    const wrapper = mount(AccessControl, {
      props: { roles: ['editor'], mode: 'disabled' },
      slots: { default: '<button>Action</button>' },
    })

    expect(wrapper.find('.access-disabled').exists()).toBe(true)
    expect(wrapper.attributes('aria-disabled')).toBe('true')
  })
})
```

### Step 4: 运行测试

Run: `pnpm exec vitest run src/features/auth/`

Expected: PASS。

### Step 5: 提交独立变更

```bash
git add src/features/auth/usePermission.ts src/features/auth/usePermission.test.ts src/features/auth/components src/features/auth/permission.ts src/features/auth/index.ts
git commit -m "feat: add operation level access control"
```

---

## 6. Task 16: 将用户管理重构为黄金 CRUD 示例

**Files:**

- Modify: `src/features/system/views/UserManageView.vue`
- Create: `src/features/system/views/UserManageView.test.ts`
- Modify: `src/features/system/api.ts`
- Modify: `src/mocks/handlers.ts`
- Create: `e2e/system-user.spec.ts`

### Step 1: 编写页面行为测试

覆盖加载、查询、分页、新增、编辑、删除、校验失败、API 失败、重复提交保护和刷新失败。

```ts
// src/features/system/views/UserManageView.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { createTestingPinia } from '@pinia/testing'
import { NConfigProvider, NMessageProvider } from 'naive-ui'
import UserManageView from './UserManageView.vue'
import { useAuthStore } from '@/features/auth/store/useAuthStore'

function createWrapper() {
  const pinia = createTestingPinia()
  const authStore = useAuthStore(pinia)
  authStore.roles = ['admin']
  authStore.permissions = [
    'system:user:read',
    'system:user:create',
    'system:user:update',
    'system:user:delete',
  ]

  return mount(UserManageView, {
    global: {
      plugins: [pinia],
      components: { NConfigProvider, NMessageProvider },
    },
  })
}

describe('UserManageView', () => {
  it('loads user list on mount', async () => {
    const wrapper = createWrapper()
    await vi.waitFor(() => {
      expect(wrapper.find('.n-data-table').exists()).toBe(true)
    })
  })

  it('shows add button when has create permission', () => {
    const wrapper = createWrapper()
    expect(wrapper.find('button:contains("新增用户")').exists()).toBe(true)
  })

  it('hides add button when no create permission', () => {
    const pinia = createTestingPinia()
    const authStore = useAuthStore(pinia)
    authStore.roles = ['viewer']
    authStore.permissions = ['system:user:read']

    const wrapper = mount(UserManageView, {
      global: {
        plugins: [pinia],
        components: { NConfigProvider, NMessageProvider },
      },
    })

    expect(wrapper.find('button:contains("新增用户")').exists()).toBe(false)
  })

  it('validates form before submit', async () => {
    const wrapper = createWrapper()

    // Open add modal
    await wrapper.find('button:contains("新增用户")').trigger('click')

    // Try to submit without filling required fields
    await wrapper.find('button:contains("确定")').trigger('click')

    // Should show validation errors
    await vi.waitFor(() => {
      expect(wrapper.find('.n-form-item-feedback--error').exists()).toBe(true)
    })
  })

  it('submits form successfully', async () => {
    const wrapper = createWrapper()

    // Open add modal
    await wrapper.find('button:contains("新增用户")').trigger('click')

    // Fill form
    await wrapper.find('input[placeholder="请输入用户名"]').setValue('testuser')
    await wrapper.find('input[placeholder="请输入昵称"]').setValue('Test User')

    // Submit
    await wrapper.find('button:contains("确定")').trigger('click')

    // Should close modal and refresh table
    await vi.waitFor(() => {
      expect(wrapper.find('.n-modal').exists()).toBe(false)
    })
  })
})
```

### Step 2: 使用泛型 ProTable 和 ProForm

移除 `Record<string, unknown>` 和重复的原始表单模板；表单必须先 validate 再提交。

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { NButton, NSpace, NTag, NPopconfirm, NModal } from 'naive-ui'
import ProTable from '@/shared/components/pro/ProTable.vue'
import ProForm from '@/shared/components/pro/ProForm.vue'
import { useMutation } from '@/shared/composables/useMutation'
import { usePermission } from '@/features/auth/usePermission'
import {
  getSystemUserPage,
  createSystemUser,
  updateSystemUser,
  deleteSystemUser,
} from '@/features/system/api'
import type { SystemUserData } from '@/features/system/api'

type UserRow = SystemUserData['items'][number]

const proTableRef = ref()
const proFormRef = ref()
const showModal = ref(false)
const editingUser = ref<UserRow | null>(null)
const formValue = ref({
  username: '',
  nickname: '',
  email: '',
  phone: '',
  status: '0' as '0' | '1',
  roles: ['viewer'] as string[],
})

const { canCreateSystem, canUpdateSystem, canDeleteSystem } = usePermission()

const createMutation = useMutation({
  mutationFn: createSystemUser,
  onSuccess: () => {
    showModal.value = false
    proTableRef.value?.refresh()
  },
})

const updateMutation = useMutation({
  mutationFn: (data: typeof formValue.value) => updateSystemUser(editingUser.value!.id, data),
  onSuccess: () => {
    showModal.value = false
    proTableRef.value?.refresh()
  },
})

const deleteMutation = useMutation({
  mutationFn: deleteSystemUser,
  onSuccess: () => {
    proTableRef.value?.refresh()
  },
})

// ... rest of implementation
</script>
```

### Step 3: 接入操作权限和 mutation 状态

分别使用 `system:user:read/create/update/delete`，无权限按钮不显示或禁用。

```vue
<template>
  <ProTable
    ref="proTableRef"
    :columns="columns"
    :request="request"
    :search-fields="searchFields"
    title="用户管理"
  >
    <template #toolbar>
      <n-button v-if="canCreateSystem" type="primary" @click="handleAdd"> 新增用户 </n-button>
    </template>
  </ProTable>

  <n-modal
    v-model:show="showModal"
    preset="dialog"
    :title="editingUser ? '编辑用户' : '新增用户'"
    style="width: 500px"
  >
    <ProForm
      ref="proFormRef"
      :fields="formFields"
      :model="formValue"
      :disabled="createMutation.isLoading.value || updateMutation.isLoading.value"
      @update:model="formValue = $event"
    >
      <template #action>
        <n-space justify="end">
          <n-button @click="showModal = false">取消</n-button>
          <n-button
            type="primary"
            :loading="createMutation.isLoading.value || updateMutation.isLoading.value"
            @click="handleSubmit"
          >
            确定
          </n-button>
        </n-space>
      </template>
    </ProForm>
  </n-modal>
</template>
```

### Step 4: 增加严格 MSW 场景

handler 校验 Authorization、method、URL 和必填字段，并提供 401、403、422、500 场景。

```ts
// src/mocks/handlers.ts
import { http, HttpResponse } from 'msw'

const systemUserHandlers = [
  // GET /api/system/users
  http.get('/api/system/users', ({ request }) => {
    const authHeader = request.headers.get('Authorization')
    if (!authHeader) {
      return new HttpResponse(null, { status: 401 })
    }

    const url = new URL(request.url)
    const page = parseInt(url.searchParams.get('page') || '1')
    const pageSize = parseInt(url.searchParams.get('pageSize') || '10')

    return HttpResponse.json({
      items: [
        {
          id: '1',
          username: 'admin',
          nickname: '管理员',
          email: 'admin@example.com',
          phone: '13800138000',
          status: '0',
          roles: ['admin'],
          createdAt: '2024-01-01',
        },
        {
          id: '2',
          username: 'viewer',
          nickname: '查看者',
          email: 'viewer@example.com',
          phone: '13800138001',
          status: '0',
          roles: ['viewer'],
          createdAt: '2024-01-02',
        },
      ],
      meta: { total: 2, page, pageSize },
    })
  }),

  // POST /api/system/users
  http.post('/api/system/users', async ({ request }) => {
    const authHeader = request.headers.get('Authorization')
    if (!authHeader) {
      return new HttpResponse(null, { status: 401 })
    }

    const body = await request.json()
    if (!body.username || !body.nickname) {
      return HttpResponse.json(
        { message: '用户名和昵称不能为空', code: 'VALIDATION_ERROR' },
        { status: 422 },
      )
    }

    return HttpResponse.json({ id: '3', ...body, createdAt: new Date().toISOString() })
  }),
]

export const handlers = [...systemUserHandlers]
```

### Step 5: 编写完整 Playwright CRUD 测试

使用可访问角色和业务名称定位器，断言请求体、成功反馈、表格更新和失败反馈。

```ts
// e2e/system-user.spec.ts
import { test, expect } from '@playwright/test'

test.describe('System User Management', () => {
  test.beforeEach(async ({ page }) => {
    // Login as admin
    await page.goto('/login')
    await page.fill('input[placeholder="请输入用户名"]', 'admin')
    await page.fill('input[placeholder="请输入密码"]', 'admin123')
    await page.click('button:has-text("登录")')
    await page.waitForURL('/admin')

    // Navigate to user management
    await page.click('text=系统管理')
    await page.click('text=用户管理')
    await page.waitForURL('/admin/system/user')
  })

  test('loads user list', async ({ page }) => {
    await expect(page.locator('.n-data-table')).toBeVisible()
    await expect(page.locator('text=admin')).toBeVisible()
  })

  test('creates new user', async ({ page }) => {
    // Click add button
    await page.click('button:has-text("新增用户")')
    await expect(page.locator('.n-modal')).toBeVisible()

    // Fill form
    await page.fill('input[placeholder="请输入用户名"]', 'newuser')
    await page.fill('input[placeholder="请输入昵称"]', 'New User')

    // Submit
    await page.click('button:has-text("确定")')

    // Verify success
    await expect(page.locator('.n-modal')).not.toBeVisible()
    await expect(page.locator('text=newuser')).toBeVisible()
  })

  test('validates required fields', async ({ page }) => {
    await page.click('button:has-text("新增用户")')

    // Submit without filling
    await page.click('button:has-text("确定")')

    // Should show validation error
    await expect(page.locator('.n-form-item-feedback--error')).toBeVisible()
  })

  test('deletes user with confirmation', async ({ page }) => {
    // Click delete button
    await page.click('button:has-text("删除")')

    // Confirm deletion
    await page.click('button:has-text("确认")')

    // Verify user removed
    await expect(page.locator('text=admin')).not.toBeVisible()
  })
})
```

### Step 6: 运行专项测试

Run: `pnpm exec vitest run src/features/system/views/UserManageView.test.ts`

Run: `pnpm e2e -- e2e/system-user.spec.ts`

Expected: PASS。

### Step 7: 提交独立变更

```bash
git add src/features/system/views/UserManageView.vue src/features/system/views/UserManageView.test.ts src/features/system/api.ts src/mocks/handlers.ts e2e/system-user.spec.ts
git commit -m "feat: add reference user management workflow"
```

---

## 7. Task 17: 让国际化、主题和移动端形成真实能力

**Files:**

- Modify: `src/core/i18n/index.ts`
- Modify: `src/core/i18n/zh-CN.ts`
- Modify: `src/core/i18n/en-US.ts`
- Create: `src/core/i18n/useLocale.ts`
- Modify: `src/shared/components/pro/ProTable.vue`
- Modify: `src/shared/components/pro/ProForm.vue`
- Modify: `src/features/system/views/UserManageView.vue`
- Modify: `src/core/theme/useTheme.ts`
- Modify: `src/style.css`
- Modify: `src/app/layouts/AdminLayout.vue`
- Modify: `e2e/core-flow.spec.ts`

### Step 1: 将共享组件和黄金示例文案改为翻译 key

路由标题使用 `titleKey`；菜单、document title、表格、表单和错误提示使用统一翻译入口。

```ts
// src/core/i18n/zh-CN.ts
export default {
  common: {
    search: '搜索',
    reset: '重置',
    refresh: '刷新',
    fullscreen: '全屏',
    exitFullscreen: '退出全屏',
    add: '新增',
    edit: '编辑',
    delete: '删除',
    confirm: '确认',
    cancel: '取消',
    save: '保存',
    loading: '加载中...',
    error: '加载失败',
    retry: '重试',
    noData: '暂无数据',
    total: '共 {count} 条',
  },
  system: {
    user: {
      title: '用户管理',
      username: '用户名',
      nickname: '昵称',
      email: '邮箱',
      phone: '手机',
      status: '状态',
      active: '正常',
      inactive: '停用',
      addUser: '新增用户',
      editUser: '编辑用户',
      deleteUser: '删除用户',
      confirmDelete: '确认删除该用户？',
    },
  },
}
```

```ts
// src/core/i18n/en-US.ts
export default {
  common: {
    search: 'Search',
    reset: 'Reset',
    refresh: 'Refresh',
    fullscreen: 'Fullscreen',
    exitFullscreen: 'Exit Fullscreen',
    add: 'Add',
    edit: 'Edit',
    delete: 'Delete',
    confirm: 'Confirm',
    cancel: 'Cancel',
    save: 'Save',
    loading: 'Loading...',
    error: 'Failed to load',
    retry: 'Retry',
    noData: 'No data',
    total: 'Total {count} items',
  },
  system: {
    user: {
      title: 'User Management',
      username: 'Username',
      nickname: 'Nickname',
      email: 'Email',
      phone: 'Phone',
      status: 'Status',
      active: 'Active',
      inactive: 'Inactive',
      addUser: 'Add User',
      editUser: 'Edit User',
      deleteUser: 'Delete User',
      confirmDelete: 'Are you sure to delete this user?',
    },
  },
}
```

### Step 2: 实现 useLocale

同步 Vue I18n、Naive UI locale/dateLocale、localStorage 和 HTML `lang`。

```ts
// src/core/i18n/useLocale.ts
import { ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { dateEnUS, dateZhCN, enUS, zhCN } from 'naive-ui'

export type Locale = 'zh-CN' | 'en-US'

const locale = ref<Locale>((localStorage.getItem('locale') as Locale) || 'zh-CN')

export function useLocale() {
  const { locale: i18nLocale } = useI18n()

  function setLocale(newLocale: Locale) {
    locale.value = newLocale
    i18nLocale.value = newLocale
    localStorage.setItem('locale', newLocale)
    document.documentElement.lang = newLocale
  }

  const naiveLocale = computed(() => {
    return locale.value === 'zh-CN' ? zhCN : enUS
  })

  const naiveDateLocale = computed(() => {
    return locale.value === 'zh-CN' ? dateZhCN : dateEnUS
  })

  // Initialize
  watch(
    locale,
    (newLocale) => {
      i18nLocale.value = newLocale
      document.documentElement.lang = newLocale
    },
    { immediate: true },
  )

  return {
    locale,
    setLocale,
    naiveLocale,
    naiveDateLocale,
  }
}
```

### Step 3: 统一主题事实源

全局 CSS 使用默认 light 和根节点 `.dark`；`prefers-color-scheme` 只参与 system 模式决策。

```ts
// src/core/theme/useTheme.ts
import { ref, watch } from 'vue'
import { useOsTheme } from 'naive-ui'

export type ThemeMode = 'light' | 'dark' | 'system'

const themeMode = ref<ThemeMode>((localStorage.getItem('theme') as ThemeMode) || 'system')

export function useTheme() {
  const osTheme = useOsTheme()

  const isDark = computed(() => {
    if (themeMode.value === 'system') {
      return osTheme.value === 'dark'
    }
    return themeMode.value === 'dark'
  })

  function setTheme(mode: ThemeMode) {
    themeMode.value = mode
    localStorage.setItem('theme', mode)
  }

  // Apply theme class to root element
  watch(
    isDark,
    (dark) => {
      document.documentElement.classList.toggle('dark', dark)
    },
    { immediate: true },
  )

  return {
    themeMode,
    isDark,
    setTheme,
  }
}
```

### Step 4: 增加响应式布局

侧栏在窄屏切换抽屉；固定宽卡片和 modal 使用 `max-width: calc(100vw - 32px)`；字典双栏和统计卡片配置断点。

```vue
<!-- src/app/layouts/AdminLayout.vue -->
<script setup lang="ts">
import { ref, computed } from 'vue'
import { NLayout, NLayoutSider, NLayoutContent, NDrawer, NDrawerContent } from 'naive-ui'
import { useWindowSize } from '@vueuse/core'

const { width } = useWindowSize()
const isMobile = computed(() => width.value < 768)
const showMobileMenu = ref(false)
</script>

<template>
  <n-layout has-sider style="height: 100vh">
    <!-- Desktop sidebar -->
    <n-layout-sider v-if="!isMobile" bordered :width="240" :native-scrollbar="false">
      <slot name="sidebar" />
    </n-layout-sider>

    <!-- Mobile drawer -->
    <n-drawer v-else v-model:show="showMobileMenu" :width="240" placement="left">
      <n-drawer-content>
        <slot name="sidebar" />
      </n-drawer-content>
    </n-drawer>

    <n-layout-content :native-scrollbar="false">
      <div style="padding: 16px; max-width: calc(100vw - 32px)">
        <slot />
      </div>
    </n-layout-content>
  </n-layout>
</template>
```

### Step 5: 增加移动端和语言切换 E2E

至少验证 375x812 和 768x1024；切换语言后菜单、表格和表单文案同步更新。

```ts
// e2e/core-flow.spec.ts
import { test, expect } from '@playwright/test'

test.describe('Responsive and Locale', () => {
  test('mobile viewport shows drawer menu', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 })
    await page.goto('/admin')

    // Should show hamburger menu
    await expect(page.locator('[aria-label="菜单"]')).toBeVisible()

    // Click to open drawer
    await page.click('[aria-label="菜单"]')
    await expect(page.locator('.n-drawer')).toBeVisible()
  })

  test('switches locale and updates UI', async ({ page }) => {
    await page.goto('/admin')

    // Click locale switcher
    await page.click('[aria-label="语言"]')
    await page.click('text=English')

    // Verify UI updated
    await expect(page.locator('text=User Management')).toBeVisible()
  })
})
```

### Step 6: 运行完整 UI 验证

Run: `pnpm e2e`

Run: `pnpm build-storybook`

Expected: PASS。

### Step 7: 提交独立变更

```bash
git add src/core/i18n src/shared/components/pro src/features/system/views/UserManageView.vue src/core/theme/useTheme.ts src/style.css src/app/layouts/AdminLayout.vue e2e/core-flow.spec.ts
git commit -m "feat: complete locale theme and responsive baseline"
```

---

## 8. 完整验收标准

### 8.1 业务开发体验

- [ ] ProTable 支持类型推断、error、retry、stale 和 latest-only
- [ ] ProForm 支持 validate、reset、required、field props 和服务端字段错误
- [ ] 用户管理示例覆盖 CRUD、权限、i18n、loading、success 和 failure
- [ ] 操作权限有统一 composable 和组件
- [ ] 移动端 375px 不出现关键操作不可达或固定宽度溢出
- [ ] 主题只使用一个事实源

### 8.2 质量门禁

- [ ] HTTP interceptor、真实 route guard、ProTable、ProForm 和用户 CRUD 有行为测试
- [ ] E2E 验证角色菜单、权限、401、会话恢复和 CRUD，不只断言 URL
- [ ] Stylelint 检查 Vue SFC
- [ ] 架构边界由 lint 自动执行

---

## 9. 最终验证命令

P2 完成后，按 CI 顺序执行：

```bash
pnpm lint
pnpm typecheck
pnpm test
pnpm build-storybook
pnpm e2e
```

预期结果：所有命令 exit code 0；测试无未处理 rejection、Vue warning 或静默跳过。
