import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { NConfigProvider } from 'naive-ui'
import { createI18n } from 'vue-i18n'
import ProCrud from './ProCrud.vue'

const i18n = createI18n({
  legacy: false,
  locale: 'zh-CN',
  messages: {
    'zh-CN': {
      common: {
        add: '新增',
        edit: '编辑',
        delete: '删除',
        batchDelete: '批量删除',
        confirmDelete: '确认删除？',
        success: '操作成功',
        createSuccess: '新增成功',
        updateSuccess: '编辑成功',
        deleteSuccess: '删除成功',
        batchDeleteSuccess: '批量删除成功',
        search: '搜索',
        reset: '重置',
        action: '操作',
        actions: '操作',
        total: '共 {total} 条',
        refresh: '刷新',
        fullscreen: '全屏',
        exitFullscreen: '退出全屏',
        confirm: '确认',
        cancel: '取消',
      },
    },
  },
})

const mockHasPermission = vi.fn(() => true)

vi.mock('@/features/auth', () => ({
  usePermission: () => ({
    hasPermission: mockHasPermission,
  }),
}))

const mockRequest = vi.fn().mockResolvedValue({
  items: [
    { id: '1', name: 'Test 1' },
    { id: '2', name: 'Test 2' },
  ],
  total: 2,
})

const mockCreateFn = vi.fn().mockResolvedValue(undefined)
const mockUpdateFn = vi.fn().mockResolvedValue(undefined)
const mockDeleteFn = vi.fn().mockResolvedValue(undefined)

const defaultProps = {
  columns: [
    { title: 'ID', key: 'id', width: 80 },
    { title: '名称', key: 'name', width: 120 },
  ],
  request: mockRequest,
  formFields: [{ key: 'name', label: '名称', required: true }],
  createFn: mockCreateFn,
  updateFn: mockUpdateFn,
  deleteFn: mockDeleteFn,
}

function createWrapper(props = {}) {
  return mount(ProCrud, {
    props: { ...defaultProps, ...props },
    global: {
      components: { NConfigProvider },
      plugins: [i18n],
    },
  })
}

describe('ProCrud', () => {
  it('should render add button when createFn is provided', () => {
    const wrapper = createWrapper()
    expect(wrapper.text()).toContain('新增')
  })

  it('should not render add button when permission denied', () => {
    mockHasPermission.mockReturnValueOnce(false)
    const wrapper = createWrapper({ permission: { create: 'test:create' } })
    expect(wrapper.text()).not.toContain('新增')
  })

  it('should render action column when updateFn or deleteFn is provided', () => {
    const wrapper = createWrapper()
    expect(wrapper.text()).toContain('操作')
  })

  it('should not render action column when no action functions provided', () => {
    const wrapper = createWrapper({
      updateFn: undefined,
      deleteFn: undefined,
    })
    expect(wrapper.text()).not.toContain('编辑')
    expect(wrapper.text()).not.toContain('删除')
  })

  it('should expose refresh and reset methods', () => {
    const wrapper = createWrapper()
    expect(wrapper.vm.refresh).toBeDefined()
    expect(wrapper.vm.reset).toBeDefined()
    expect(wrapper.vm.openAdd).toBeDefined()
    expect(wrapper.vm.openEdit).toBeDefined()
  })
})
