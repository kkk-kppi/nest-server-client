/* eslint-disable vue/one-component-per-file */
import { mount } from '@vue/test-utils'
import { describe, expect, it, vi } from 'vitest'
import { defineComponent, ref, nextTick, h } from 'vue'
import ErrorBoundary from './ErrorBoundary.vue'

const ThrowingChild = defineComponent({
  name: 'ThrowingChild',
  setup() {
    return () => {
      throw new Error('render error')
    }
  },
})

const NormalChild = defineComponent({
  name: 'NormalChild',
  template: '<div class="normal">normal content</div>',
})

describe('ErrorBoundary', () => {
  it('renders child when no error', () => {
    const wrapper = mount(ErrorBoundary, {
      slots: { default: NormalChild },
    })
    expect(wrapper.find('.normal').exists()).toBe(true)
    expect(wrapper.find('.error-fallback').exists()).toBe(false)
  })

  it('renders fallback when child throws', async () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

    const wrapper = mount(ErrorBoundary, {
      slots: { default: ThrowingChild },
      global: {
        config: {
          errorHandler: () => {
            // Let ErrorBoundary handle it
          },
        },
      },
    })

    await nextTick()

    expect(wrapper.find('.error-fallback').exists()).toBe(true)
    expect(wrapper.text()).toContain('页面出错了')

    consoleSpy.mockRestore()
  })

  it('resets error on retry', async () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

    const shouldThrow = ref(true)
    const ConditionalThrow = defineComponent({
      name: 'ConditionalThrow',
      setup() {
        return () => {
          if (shouldThrow.value) {
            throw new Error('test error')
          }
          return h('div', { class: 'ok' }, 'recovered')
        }
      },
    })

    const wrapper = mount(ErrorBoundary, {
      slots: { default: ConditionalThrow },
      global: {
        config: {
          errorHandler: () => {
            // Let ErrorBoundary handle it
          },
        },
      },
    })

    await nextTick()

    expect(wrapper.find('.error-fallback').exists()).toBe(true)

    shouldThrow.value = false
    await wrapper.find('button').trigger('click')
    await nextTick()

    expect(wrapper.find('.error-fallback').exists()).toBe(false)
    expect(wrapper.find('.ok').exists()).toBe(true)

    consoleSpy.mockRestore()
  })
})
