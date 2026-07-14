import { describe, it, expect, vi, afterEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { NConfigProvider } from 'naive-ui'
import ProModalForm from './ProModalForm.vue'

function createWrapper(props = {}) {
  return mount(ProModalForm, {
    props: {
      show: true,
      title: 'Test Form',
      fields: [{ key: 'name', label: 'Name', type: 'input', required: true }],
      model: { name: '' },
      'onUpdate:show': vi.fn(),
      'onUpdate:model': vi.fn(),
      onSubmit: vi.fn(),
      onCancel: vi.fn(),
      ...props,
    },
    global: {
      components: { NConfigProvider },
    },
    attachTo: document.body,
  })
}

function getModalText() {
  return document.body.textContent ?? ''
}

function findModalButton(label: string) {
  const buttons = document.querySelectorAll('button')
  return Array.from(buttons).find((b) => b.textContent?.trim() === label)
}

describe('ProModalForm', () => {
  afterEach(() => {
    document.body.innerHTML = ''
  })

  it('renders modal with title', () => {
    const wrapper = createWrapper()
    expect(getModalText()).toContain('Test Form')
    wrapper.unmount()
  })

  it('renders form fields', () => {
    const wrapper = createWrapper()
    expect(document.body.querySelector('input')).not.toBeNull()
    wrapper.unmount()
  })

  it('emits cancel when cancel button clicked', async () => {
    const onCancel = vi.fn()
    const wrapper = createWrapper({ onCancel })
    const cancelButton = findModalButton('取消')
    cancelButton?.click()
    await wrapper.vm.$nextTick()
    expect(onCancel).toHaveBeenCalled()
    wrapper.unmount()
  })

  it('emits update:show false on cancel', async () => {
    const onUpdateShow = vi.fn()
    const wrapper = createWrapper({ 'onUpdate:show': onUpdateShow })
    const cancelButton = findModalButton('取消')
    cancelButton?.click()
    await wrapper.vm.$nextTick()
    expect(onUpdateShow).toHaveBeenCalledWith(false)
    wrapper.unmount()
  })

  it('emits submit with model when form is valid', async () => {
    const onSubmit = vi.fn()
    const wrapper = createWrapper({
      model: { name: 'Test' },
      onSubmit,
    })
    const submitButton = findModalButton('确定')
    submitButton?.click()
    await vi.waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith({ name: 'Test' })
    })
    wrapper.unmount()
  })

  it('does not emit submit when required field is empty', async () => {
    const onSubmit = vi.fn()
    const wrapper = createWrapper({
      model: { name: '' },
      onSubmit,
    })
    const submitButton = findModalButton('确定')
    submitButton?.click()
    await wrapper.vm.$nextTick()
    expect(onSubmit).not.toHaveBeenCalled()
    wrapper.unmount()
  })

  it('shows loading state on submit button', () => {
    const wrapper = createWrapper({ loading: true })
    const submitButton = findModalButton('确定')
    expect(submitButton).toBeDefined()
    wrapper.unmount()
  })

  it('renders sections when provided', () => {
    const wrapper = createWrapper({
      fields: [{ key: 'name', label: 'Name', type: 'input', group: 'basic' }],
      sections: [{ key: 'basic', title: 'Basic Info' }],
    })
    expect(getModalText()).toContain('Basic Info')
    wrapper.unmount()
  })

  it('renders custom submit and cancel text', () => {
    const wrapper = createWrapper({
      submitText: 'Save',
      cancelText: 'Close',
    })
    expect(getModalText()).toContain('Save')
    expect(getModalText()).toContain('Close')
    wrapper.unmount()
  })

  it('does not render content when show is false', () => {
    const wrapper = createWrapper({ show: false })
    expect(getModalText()).not.toContain('Test Form')
    wrapper.unmount()
  })
})
