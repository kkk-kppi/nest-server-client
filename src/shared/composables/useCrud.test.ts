import { describe, it, expect, vi } from 'vitest'
import { useCrud } from './useCrud'

vi.mock('vue-i18n', () => ({
  useI18n: () => ({
    t: (key: string) => key,
  }),
}))

vi.mock('@/features/auth', () => ({
  usePermission: () => ({
    hasPermission: () => true,
  }),
}))

describe('useCrud', () => {
  const mockRequest = vi.fn().mockResolvedValue({ items: [], total: 0 })
  const mockCreateFn = vi.fn().mockResolvedValue(undefined)
  const mockUpdateFn = vi.fn().mockResolvedValue(undefined)
  const mockDeleteFn = vi.fn().mockResolvedValue(undefined)

  const defaultOptions = {
    columns: [{ title: 'Name', key: 'name' }],
    request: mockRequest,
    formFields: [{ key: 'name', label: 'Name', required: true }],
    createFn: mockCreateFn,
    updateFn: mockUpdateFn,
    deleteFn: mockDeleteFn,
  }

  it('should return tableProps and modalProps', () => {
    const { tableProps, modalProps } = useCrud(defaultOptions)
    expect(tableProps.value).toBeDefined()
    expect(modalProps.value).toBeDefined()
  })

  it('should open add modal', () => {
    const { showModal, editingRow, openAdd } = useCrud(defaultOptions)
    openAdd()
    expect(showModal.value).toBe(true)
    expect(editingRow.value).toBeNull()
  })

  it('should open edit modal with row data', () => {
    const { showModal, editingRow, formValue, openEdit } = useCrud(defaultOptions)
    const row = { id: '1', name: 'Test' }
    openEdit(row)
    expect(showModal.value).toBe(true)
    expect(editingRow.value).toEqual(row)
    expect(formValue.value).toEqual(row)
  })

  it('should call createFn on submit when not editing', async () => {
    const { openAdd, handleSubmit, formValue } = useCrud(defaultOptions)
    openAdd()
    formValue.value = { name: 'New Item' }
    await handleSubmit()
    expect(mockCreateFn).toHaveBeenCalledWith({ name: 'New Item' })
  })

  it('should call updateFn on submit when editing', async () => {
    const { openEdit, handleSubmit, formValue } = useCrud(defaultOptions)
    openEdit({ id: '1', name: 'Old' })
    formValue.value = { id: '1', name: 'Updated' }
    await handleSubmit()
    expect(mockUpdateFn).toHaveBeenCalledWith('1', { id: '1', name: 'Updated' })
  })

  it('should call deleteFn on delete', async () => {
    const { handleDelete } = useCrud(defaultOptions)
    await handleDelete({ id: '1', name: 'Test' })
    expect(mockDeleteFn).toHaveBeenCalledWith('1')
  })
})
