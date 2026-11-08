import { describe, expect, it } from 'vitest'
import { METRIC_KEYS } from '@/features/metric/types'
import { MONTHS } from '@/features/metric/month'
import { getTierMock } from '@/mocks/tier'
import { deriveMonth, hashStr, toPercentiles } from '@/mocks/tier/generate'
import { DONG_ITEMS_2025_10 } from '@/mocks/tier/dong-2025-10'
import { SIGUNGU_ITEMS_2025_10 } from '@/mocks/tier/sigungu-2025-10'

describe('toPercentiles', () => {
  it('최솟값 0, 최댓값 100, 동점 같은 값', () => {
    expect(toPercentiles([10, 20, 30])).toEqual([0, 50, 100])
    expect(toPercentiles([5, 5, 9])).toEqual([0, 0, 100])
    expect(toPercentiles([7])).toEqual([50])
  })
})

describe('hashStr', () => {
  it('결정적', () => {
    expect(hashStr('51820:quiet')).toBe(hashStr('51820:quiet'))
    expect(hashStr('a')).not.toBe(hashStr('b'))
  })
})

describe('deriveMonth', () => {
  it('10월은 픽스처 그대로', () => {
    expect(deriveMonth(SIGUNGU_ITEMS_2025_10, '2025-10')).toBe(SIGUNGU_ITEMS_2025_10)
  })
  it('다른 달: 0~100 정수, overnight 불변(연중 상수), id 유지, 결정적', () => {
    const a = deriveMonth(DONG_ITEMS_2025_10, '2025-03')
    const b = deriveMonth(DONG_ITEMS_2025_10, '2025-03')
    expect(a).toEqual(b)
    a.forEach((item, i) => {
      expect(item.id).toBe(DONG_ITEMS_2025_10[i].id)
      expect(item.scores.overnight).toBe(DONG_ITEMS_2025_10[i].scores.overnight)
      for (const k of METRIC_KEYS) {
        expect(Number.isInteger(item.scores[k])).toBe(true)
        expect(item.scores[k]).toBeGreaterThanOrEqual(0)
        expect(item.scores[k]).toBeLessThanOrEqual(100)
      }
    })
  })
})

describe('getTierMock', () => {
  it('13개 달 × 2 범위 모두 응답', () => {
    for (const month of MONTHS) {
      expect(getTierMock(month, 'sigungu').items).toHaveLength(12)
      expect(getTierMock(month, 'dong').items).toHaveLength(67)
      expect(getTierMock(month, 'dong').month).toBe(month)
    }
  })
  it('10월은 수작업 픽스처', () => {
    expect(getTierMock('2025-10', 'sigungu').items).toBe(SIGUNGU_ITEMS_2025_10)
  })
})
