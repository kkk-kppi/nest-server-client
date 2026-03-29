import { describe, expect, it } from 'vitest'
import {
  clampPage,
  getTotalPages,
  hasPageItems,
  parsePositiveInt,
  resolvePageSize,
} from './pagination'

describe('getTotalPages', () => {
  it('returns 1 when total is 0', () => {
    expect(getTotalPages(0, 2)).toBe(1)
  })

  it('returns ceil result for normal values', () => {
    expect(getTotalPages(11, 5)).toBe(3)
  })

  it('returns 1 when pageSize is invalid', () => {
    expect(getTotalPages(10, 0)).toBe(1)
  })
})

describe('clampPage', () => {
  it('clamps page to lower boundary', () => {
    expect(clampPage(0, 4)).toBe(1)
  })

  it('clamps page to upper boundary', () => {
    expect(clampPage(7, 4)).toBe(4)
  })

  it('returns page when page is valid', () => {
    expect(clampPage(3, 4)).toBe(3)
  })
})

describe('hasPageItems', () => {
  it('returns false for undefined', () => {
    expect(hasPageItems(undefined)).toBe(false)
  })

  it('returns false for empty list', () => {
    expect(hasPageItems([])).toBe(false)
  })

  it('returns true for non-empty list', () => {
    expect(hasPageItems([1])).toBe(true)
  })
})

describe('parsePositiveInt', () => {
  it('returns fallback for undefined', () => {
    expect(parsePositiveInt(undefined, 2)).toBe(2)
  })

  it('returns fallback for invalid value', () => {
    expect(parsePositiveInt('0', 2)).toBe(2)
  })

  it('returns parsed number for valid value', () => {
    expect(parsePositiveInt('5', 2)).toBe(5)
  })
})

describe('resolvePageSize', () => {
  it('returns fallback when value is not in options', () => {
    expect(resolvePageSize(3, [2, 5, 10], 2)).toBe(2)
  })

  it('returns value when options contain value', () => {
    expect(resolvePageSize(10, [2, 5, 10], 2)).toBe(10)
  })
})
