import { describe, expect, it } from 'vitest'
import { formatMonths } from '@/features/region/format'

describe('formatMonths', () => {
  it('[2,3] → 2 · 3월', () => {
    expect(formatMonths([2, 3])).toBe('2 · 3월')
  })
  it('[12,2] 는 순서 유지', () => {
    expect(formatMonths([12, 2])).toBe('12 · 2월')
  })
  it('1개', () => {
    expect(formatMonths([7])).toBe('7월')
  })
  it('빈 배열은 —', () => {
    expect(formatMonths([])).toBe('—')
  })
})
