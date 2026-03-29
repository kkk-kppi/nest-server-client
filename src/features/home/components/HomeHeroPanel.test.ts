import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import HomeHeroPanel from './HomeHeroPanel.vue'

describe('HomeHeroPanel', () => {
  it('renders and updates counter', async () => {
    const wrapper = mount(HomeHeroPanel)

    expect(wrapper.text()).toContain('Count is 0')
    await wrapper.get('button.counter').trigger('click')
    expect(wrapper.text()).toContain('Count is 1')
  })
})
