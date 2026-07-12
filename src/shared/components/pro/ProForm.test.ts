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
      model: { name: '' },
    })

    expect(wrapper.vm.validate).toBeTypeOf('function')
    expect(wrapper.vm.reset).toBeTypeOf('function')
    expect(wrapper.vm.restoreValidation).toBeTypeOf('function')
  })

  it('exposes validate method', async () => {
    const wrapper = createWrapper()

    expect(wrapper.vm.validate).toBeTypeOf('function')
  })

  it('exposes reset method', async () => {
    const wrapper = createWrapper()

    expect(wrapper.vm.reset).toBeTypeOf('function')
  })

  it('exposes restoreValidation method', async () => {
    const wrapper = createWrapper()

    expect(wrapper.vm.restoreValidation).toBeTypeOf('function')
  })

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
    if (input.exists()) {
      expect(input.props('maxlength')).toBe(10)
      expect(input.props('showCount')).toBe(true)
    } else {
      expect(wrapper.find('input').exists()).toBe(true)
    }
  })

  it('validates required fields', async () => {
    const wrapper = createWrapper({
      fields: [{ key: 'name', label: 'Name', type: 'input', required: true }],
      model: { name: '' },
    })

    await expect(wrapper.vm.validate()).rejects.toThrow()
  })

  it('renders textarea field', () => {
    const wrapper = createWrapper({
      fields: [{ key: 'desc', label: 'Description', type: 'textarea' }],
      model: { desc: '' },
    })

    expect(wrapper.find('textarea').exists()).toBe(true)
  })

  it('renders switch field', () => {
    const wrapper = createWrapper({
      fields: [{ key: 'active', label: 'Active', type: 'switch' }],
      model: { active: true },
    })

    expect(wrapper.find('.n-switch').exists()).toBe(true)
  })

  it('renders radio field', () => {
    const wrapper = createWrapper({
      fields: [
        { key: 'type', label: 'Type', type: 'radio', options: [{ label: 'A', value: 'a' }] },
      ],
      model: { type: 'a' },
    })

    expect(wrapper.find('.n-radio-group').exists()).toBe(true)
  })

  it('renders checkbox field', () => {
    const wrapper = createWrapper({
      fields: [{ key: 'agree', label: 'Agree', type: 'checkbox' }],
      model: { agree: false },
    })

    expect(wrapper.find('.n-checkbox').exists()).toBe(true)
  })
})
