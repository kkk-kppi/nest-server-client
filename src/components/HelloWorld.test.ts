import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import HelloWorld from './HelloWorld.vue'

describe('HelloWorld', () => {
  it('renders default counter and increments after click', async () => {
    const wrapper = mount(HelloWorld)

    expect(wrapper.text()).toContain('Count is 0')
    await wrapper.get('button.counter').trigger('click')
    expect(wrapper.text()).toContain('Count is 1')
  })
})
