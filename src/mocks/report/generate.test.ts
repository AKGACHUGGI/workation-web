import { describe, expect, it } from 'vitest'
import { getReportMock } from '@/mocks/report'

describe('report mock · 고성군(51820) 연간 quiet', () => {
  const r = getReportMock('51820', 'quiet')!

  it('존재한다', () => {
    expect(r).not.toBeNull()
    expect(r.name).toBe('고성군')
    expect(r.year).toBe(2025)
  })
  it('집중도 35% · 7·8·10월 · 평균 30 · 2위', () => {
    expect(r.peakConcentration).toEqual({
      value: 35,
      topMonths: [7, 8, 10],
      average: 30,
      rank: 2,
      total: 12,
    })
  })
  it('숙박 0.98 → 83 S', () => {
    expect(r.overnight).toEqual({ coef: 0.98, score: 83, grade: 'S' })
  })
  it('순위 5/12, 순위표 12개 내림차순', () => {
    expect(r.ranking.rank).toBe(5)
    expect(r.ranking.total).toBe(12)
    expect(r.ranking.items.map((i) => i.score)).toEqual([
      57, 56, 54, 51, 48, 48, 47, 36, 34, 30, 27, 22,
    ])
    expect(r.ranking.items[4]).toEqual({ id: '51820', name: '고성군', score: 48 })
  })
  it('지표 순위가 진단 문장과 일치 — 조용함 2위 · 저녁 활기 11위 · 또래 밀도 10위', () => {
    expect(r.metricRanks.quiet.rank).toBe(2)
    expect(r.metricRanks.vibe.rank).toBe(11)
    expect(r.metricRanks.peer.rank).toBe(10)
  })
  it('months 12개, 최대 100', () => {
    expect(r.months.map((m) => m.crowd)).toEqual([53, 41, 41, 46, 60, 60, 80, 100, 52, 68, 52, 47])
  })
  it('seasonType · 문장', () => {
    expect(r.seasonType).toBe('second_half_rise')
    expect(r.seasonNarrative).toContain('하반기 상승형')
    expect(r.diagnosis.strength.length).toBeGreaterThan(0)
  })
})

describe('report mock · 다른 시군구', () => {
  it('12개 모두 있고 순위가 순위표 위치와 일치한다', () => {
    const ids = [
      '51820',
      '51210',
      '51830',
      '51150',
      '51170',
      '52110',
      '52140',
      '52800',
      '46150',
      '46770',
      '50110',
      '50130',
    ]
    for (const id of ids) {
      const r = getReportMock(id, 'quiet')!
      expect(r.ranking.items[r.ranking.rank - 1].id).toBe(id)
      expect(r.months).toHaveLength(12)
      expect(Math.max(...r.months.map((m) => m.crowd))).toBe(100)
    }
  })
  it('lively 프리셋은 다른 순위표', () => {
    expect(getReportMock('52110', 'lively')!.ranking.rank).toBe(1) // 전주
  })
  it('없는 id 는 null', () => {
    expect(getReportMock('00000', 'quiet')).toBeNull()
  })
})
