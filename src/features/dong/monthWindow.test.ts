import { describe, expect, it } from 'vitest'
import { monthWindow } from '@/features/dong/monthWindow'

describe('monthWindow', () => {
  it('선택 월 ±1', () => {
    expect(monthWindow('2025-10')).toEqual(['2025-09', '2025-10', '2025-11'])
  })
  it('1월은 1·2·3월, 12월은 10·11·12월', () => {
    expect(monthWindow('2025-01')).toEqual(['2025-01', '2025-02', '2025-03'])
    expect(monthWindow('2025-12')).toEqual(['2025-10', '2025-11', '2025-12'])
  })
  it('연간은 최근 3개월', () => {
    expect(monthWindow('annual')).toEqual(['2025-10', '2025-11', '2025-12'])
  })
})
