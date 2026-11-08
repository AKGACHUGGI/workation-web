import { describe, expect, it } from 'vitest'
import { formatCount } from '@/features/popular/format'

describe('formatCount', () => {
  it('1,000 미만 그대로', () => {
    expect(formatCount(999)).toBe('999')
    expect(formatCount(0)).toBe('0')
  })
  it('1,000 이상 천 단위, 소수 1자리 버림', () => {
    expect(formatCount(1000)).toBe('1천')
    expect(formatCount(8200)).toBe('8.2천')
    expect(formatCount(8290)).toBe('8.2천')
  })
  it('10,000 이상 만 단위', () => {
    expect(formatCount(12600)).toBe('1.2만')
    expect(formatCount(10000)).toBe('1만')
    expect(formatCount(112000)).toBe('11.2만')
  })
})
