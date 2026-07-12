import { describe, it, expect, vi } from 'vitest'
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
