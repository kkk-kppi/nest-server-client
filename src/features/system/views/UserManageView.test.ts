import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { createTestingPinia } from '@pinia/testing'
import { NConfigProvider, NMessageProvider } from 'naive-ui'
import UserManageView from './UserManageView.vue'
import { useAuthStore } from '@/features/auth/store/useAuthStore'

function createWrapper() {
  const pinia = createTestingPinia({
    createSpy: (fn: () => void) => {
      return vi.fn(fn)
    },
  })
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
    expect(wrapper.find('button').exists()).toBe(true)
  })

  it('renders without errors', () => {
    const pinia = createTestingPinia({
      createSpy: (fn: () => void) => {
        return vi.fn(fn)
      },
    })
    const authStore = useAuthStore(pinia)
    authStore.roles = ['viewer']
    authStore.permissions = ['system:user:read']

    const wrapper = mount(UserManageView, {
      global: {
        plugins: [pinia],
        components: { NConfigProvider, NMessageProvider },
      },
    })

    expect(wrapper.exists()).toBe(true)
  })
})
