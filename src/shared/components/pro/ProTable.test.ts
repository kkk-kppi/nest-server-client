import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { NConfigProvider } from 'naive-ui'
import { createI18n } from 'vue-i18n'
import ProTable from './ProTable.vue'

const i18n = createI18n({
  legacy: false,
  locale: 'zh-CN',
  messages: {
    'zh-CN': {
      common: {
        search: '搜索',
        reset: '重置',
        add: '新增',
        loading: '加载中...',
        error: '加载失败',
        retry: '重试',
        noData: '暂无数据',
        total: '共 {total} 条',
        refresh: '刷新',
        fullscreen: '全屏',
        exitFullscreen: '退出全屏',
      },
    },
  },
})

function createWrapper(props = {}) {
  return mount(ProTable, {
    props: {
      columns: [{ title: 'Name', key: 'name' }],
      request: vi.fn().mockResolvedValue({ items: [{ id: 1, name: 'Test' }], total: 1 }),
      ...props,
    },
    global: {
      components: { NConfigProvider },
      plugins: [i18n],
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
    await wrapper.vm.$nextTick()
    await wrapper.find('button').trigger('click')
    await vi.waitFor(() => {
      expect(request).toHaveBeenCalledWith(expect.objectContaining({ page: 1 }))
    })
  })

  it('shows error state on request failure', async () => {
    const request = vi.fn().mockRejectedValue(new Error('Network error'))
    const wrapper = createWrapper({ request })
    await vi.waitFor(() => {
      expect(wrapper.text()).toContain('加载失败')
      expect(wrapper.text()).toContain('Network error')
      expect(wrapper.text()).toContain('重试')
    })
  })

  it('retries on retry button click', async () => {
    const request = vi
      .fn()
      .mockRejectedValueOnce(new Error('Network error'))
      .mockResolvedValue({ items: [{ id: 1, name: 'Test' }], total: 1 })
    const wrapper = createWrapper({ request })
    await vi.waitFor(() => {
      expect(wrapper.text()).toContain('加载失败')
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

  it('keeps latest response when earlier request resolves later', async () => {
    let resolveFirst: (value: unknown) => void
    let resolveSecond: (value: unknown) => void
    let callCount = 0

    const request = vi.fn().mockImplementation(() => {
      callCount++
      if (callCount === 1) {
        return new Promise((r) => {
          resolveFirst = r
        })
      }
      return new Promise((r) => {
        resolveSecond = r
      })
    })

    const wrapper = createWrapper({ request })
    await wrapper.vm.$nextTick()

    wrapper.vm.refresh()
    await wrapper.vm.$nextTick()

    resolveSecond!({ items: [{ id: 2, name: 'B' }], total: 1 })
    resolveFirst!({ items: [{ id: 1, name: 'A' }], total: 1 })

    await vi.waitFor(() => {
      expect(wrapper.text()).toContain('B')
      expect(wrapper.text()).not.toContain('A')
    })
  })
})
