import { describe, expect, it } from 'vitest'
import { GEUMAM_DETAIL, JUMUNJIN_DETAIL, dongMock } from '@/mocks/explore/dong'
import { allPins } from '@/mocks/explore/pins'

describe('dongMock', () => {
  it('주문진읍 실측', () => {
    const d = dongMock('5115025000')!
    expect(d).toBe(JUMUNJIN_DETAIL)
    expect(d.types.map((t) => [t.name, t.score])).toEqual([
      ['장기체류형', 61],
      ['로컬살이형', 60],
      ['네트워킹형', 50],
      ['몰입형', 36],
    ])
    expect(d.hourly.weekday).toMatchObject({ peakHour: 12, quietHour: 9 })
    expect(d.hourly.weekend).toMatchObject({ peakHour: 14, quietHour: 3 })
    expect(d.months.quiet).toEqual([2, 4, 9])
    expect(d.similar.map((s) => [s.name, s.common])).toEqual([
      ['노학동', 6],
      ['대정읍', 4],
      ['영천동', 5],
    ])
  })
  it('금암동 실측 (내륙)', () => {
    const d = dongMock('5211357500')!
    expect(d).toBe(GEUMAM_DETAIL)
    expect(d.coastKm).toBeNull()
    expect(d.types[0]).toMatchObject({ name: '네트워킹형', score: 96 })
    expect(d.months).toMatchObject({ quiet: [1, 2, 8], basis: '전주시' })
    expect(d.hourly.weekday).toMatchObject({ peakHour: 17, quietHour: 10 })
  })
  it('그 밖의 동은 핀 값으로 결정적 생성', () => {
    const d = dongMock('5121057000')!
    expect(dongMock('5121057000')).toEqual(d)
    const pin = allPins().get('5121057000')!
    expect(d.types[0]).toMatchObject({ name: pin.topType, score: pin.topScore })
    expect(d.types.map((t) => t.score)).toEqual(
      [...d.types.map((t) => t.score)].sort((a, b) => b - a),
    )
    expect(d.types).toHaveLength(4)
    expect(d.grades.quiet?.grade).toBe(pin.grades.quiet)
    for (const day of ['weekday', 'weekend'] as const) expect(d.hourly[day].driv).toHaveLength(24)
    expect(d.hourly.weekday.quietHour).toBeGreaterThanOrEqual(9)
    expect(d.hourly.weekday.quietHour).toBeLessThanOrEqual(17)
    expect(d.months.raw).toHaveLength(12)
    expect(d.months.quiet).toHaveLength(3)
    expect(d.briefing).toHaveLength(3)
    expect(d.similar).toHaveLength(3)
    for (const s of d.similar) expect(allPins().get(s.id)!.coastal).toBe(pin.coastal)
  })
  it('없는 동 → null', () => {
    expect(dongMock('0000000000')).toBeNull()
  })
})
