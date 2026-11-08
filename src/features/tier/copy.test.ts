import { describe, expect, it } from 'vitest'
import { METRIC_DEFINITION } from '@/features/metric/constants'
import { TIER_RANGE, tierDescription, tierFootnote } from '@/features/tier/copy'
import type { TierCopyParams } from '@/features/tier/copy'

const base: TierCopyParams = {
  tab: 'value',
  preset: 'quiet',
  metrics: ['quiet', 'crowd', 'overnight'],
  metric: 'quiet',
}

describe('tierDescription', () => {
  it('프리셋', () => {
    expect(tierDescription(base, 'S')).toBe('조용한 곳 프리셋 종합 점수')
    expect(tierDescription(base, 'A')).toBe('평균 이상')
    expect(tierDescription(base, 'B')).toBe('평균 이하')
    expect(tierDescription({ ...base, preset: 'lively' }, 'C')).toBe(
      '활기 있는 한 달 조건과 거리 있음',
    )
  })
  it('직접 설정', () => {
    const p = { ...base, preset: 'custom' as const }
    expect(tierDescription(p, 'S')).toBe('직접 설정 종합 점수 (조용 · 시기 · 숙박)')
    expect(tierDescription(p, 'C')).toBe('선택한 조건과 거리 있음')
  })
  it('개별 지표', () => {
    const p = { ...base, tab: 'metric' as const, metric: 'quiet' as const }
    expect(tierDescription(p, 'S')).toBe('동네 조용함 · 낮 유입 지수 낮음')
    expect(tierDescription(p, 'C')).toBe('낮에 사람이 몰리는 지역')
    expect(tierDescription({ ...p, metric: 'vibe' }, 'C')).toBe('저녁이 한산한 지역')
  })
  it('범위 라벨', () => {
    expect(TIER_RANGE).toEqual({ S: '상위 25%', A: '상위 25~50%', B: '하위 25~50%', C: '하위 25%' })
  })
})

describe('tierFootnote', () => {
  it('프리셋·직접 설정·개별 지표', () => {
    expect(tierFootnote(base)).toMatch(/^등급은 선택한 프리셋의 종합 점수를/)
    expect(tierFootnote({ ...base, preset: 'custom' })).toMatch(/^직접 설정에서는 고른 지표만/)
    const metric = tierFootnote({ ...base, tab: 'metric', metric: 'quiet' })
    expect(metric).toContain(METRIC_DEFINITION.quiet)
    expect(metric).toContain('동네 성격 그룹(동네 조용함 · 또래 밀도 · 저녁 활기)')
    for (const p of [base, { ...base, tab: 'metric' as const }]) {
      expect(tierFootnote(p)).toContain('마스킹 비율 30% 초과 행정동은 비공개.')
    }
  })
})
