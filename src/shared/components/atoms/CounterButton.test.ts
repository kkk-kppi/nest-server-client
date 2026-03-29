import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import CounterButton from './CounterButton.vue'

describe('CounterButton', () => {
  it('renders label and emits click', async () => {
    const wrapper = mount(CounterButton, {
      props: {
        label: 'Count is 0',
      },
    })

    expect(wrapper.text()).toContain('Count is 0')
    await wrapper.get('button.counter').trigger('click')
    expect(wrapper.emitted('click')).toBeTruthy()
  })
})
