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

  it('enables content when has access in disabled mode', () => {
    const wrapper = mount(AccessControl, {
      props: { roles: ['admin'], mode: 'disabled' },
      slots: { default: '<button>Action</button>' },
    })

    expect(wrapper.find('.access-disabled').exists()).toBe(false)
    expect(wrapper.attributes('aria-disabled')).toBe('false')
  })

  it('checks permissions', () => {
    const wrapper = mount(AccessControl, {
      props: { permissions: ['system:user:read'], mode: 'hide' },
      slots: { default: '<div>Content</div>' },
    })

    expect(wrapper.text()).toContain('Content')
  })

  it('hides when permission missing', () => {
    const wrapper = mount(AccessControl, {
      props: { permissions: ['system:user:delete'], mode: 'hide' },
      slots: { default: '<div>Content</div>' },
    })

    expect(wrapper.text()).not.toContain('Content')
  })
})
