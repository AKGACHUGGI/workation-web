import { describe, expect, it } from 'vitest'
import {
  concentrationCopy,
  overnightSubtitle,
  positionCopy,
  reportFileName,
  strongestMetric,
  weakestMetric,
} from '@/features/report/copy'
import type { ReportResponse } from '@/features/report/types'

const ranks: ReportResponse['metricRanks'] = {
  quiet: { rank: 2, score: 65 },
  crowd: { rank: 7, score: 45 },
  peer: { rank: 10, score: 35 },
  overnight: { rank: 2, score: 83 },
  vibe: { rank: 11, score: 20 },
}

describe('reportFileName', () => {
  it('{name}_진단리포트_{year}.pdf', () => {
    expect(reportFileName('고성군', 2025)).toBe('고성군_진단리포트_2025.pdf')
  })
})

describe('strongestMetric / weakestMetric', () => {
  it('rank 최소·최대. 동점은 METRIC_KEYS 순서(quiet 우선)', () => {
    expect(strongestMetric(ranks)).toBe('quiet') // quiet·overnight 둘 다 2위 → quiet
    expect(weakestMetric(ranks)).toBe('vibe')
  })
})

describe('concentrationCopy', () => {
  it('평균보다 높음', () => {
    expect(
      concentrationCopy({ value: 35, topMonths: [7, 8, 10], average: 30, rank: 2, total: 12 }),
    ).toBe('상위 3개월(7 · 8 · 10월) 방문인구 ÷ 연간 방문인구. 12곳 평균 30%보다 집중도 높음 (2위)')
  })
  it('평균보다 낮음', () => {
    expect(
      concentrationCopy({ value: 23, topMonths: [4, 5, 10], average: 30, rank: 12, total: 12 }),
    ).toBe(
      '상위 3개월(4 · 5 · 10월) 방문인구 ÷ 연간 방문인구. 12곳 평균 30%보다 집중도 낮음 (12위)',
    )
  })
})

describe('overnightSubtitle', () => {
  it('계수 + 설명 + 구간 문구', () => {
    expect(overnightSubtitle(0.98)).toBe(
      '숙박 계수 0.98 · 방문객 1명당 밤 체류 증가분 · 연간 기준. 방문객 대부분 숙박',
    )
  })
})

describe('positionCopy', () => {
  it('프리셋 라벨 + 최강 지표 순위 + 최약 지표 rankCopy', () => {
    expect(positionCopy('quiet', ranks)).toBe(
      '조용한 곳 프리셋 연간 순위. 동네 조용함 2위 · 저녁 활기 하위권',
    )
  })
})
