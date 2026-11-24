import { describe, expect, it } from 'vitest'
import { ACTIVITY_KEYS } from '@/features/dong/types'
import { DONG_MOCK_IDS } from '@/mocks/dong/manual'
import { makeDongMock } from '@/mocks/dong/makeDongMock'
import { GEOJIN_2025_10 } from '@/mocks/dong/geojin-2025-10'

describe('makeDongMock', () => {
  it('거진읍 10월은 고정 픽스처와 같다', () => {
    expect(makeDongMock('5182025300', '2025-10')).toEqual(GEOJIN_2025_10)
  })
  it('모든 동·월 응답이 계약을 만족한다 (24시간, 최대 100, 비중 합 100, 유사 동네 ≤ 3)', () => {
    for (const id of DONG_MOCK_IDS) {
      for (const month of ['annual', '2025-01', '2025-06', '2025-12'] as const) {
        const d = makeDongMock(id, month)
        expect(d.id).toBe(id)
        expect(d.month).toBe(month)
        expect(d.hourly.weekday).toHaveLength(24)
        expect(d.hourly.weekend).toHaveLength(24)
        expect(Math.max(...d.hourly.weekday, ...d.hourly.weekend)).toBe(100)
        expect(ACTIVITY_KEYS.reduce((s, k) => s + d.activityMix[k], 0)).toBe(100)
        expect(d.quieterTwins.length).toBeLessThanOrEqual(3)
        expect(d.hourly.weekday[d.peaks.weekday.peakHour]).toBe(100)
      }
    }
  })
  it('같은 입력은 같은 출력 (결정적)', () => {
    expect(makeDongMock('5011062000', '2025-03')).toEqual(makeDongMock('5011062000', '2025-03'))
  })
  it('1차 범위: DONG_MANUAL 9곳만 상세가 있다 (거진읍 유사 동네 3곳 포함)', () => {
    expect(DONG_MOCK_IDS).toHaveLength(9)
    for (const twin of GEOJIN_2025_10.quieterTwins) expect(DONG_MOCK_IDS).toContain(twin.id)
  })
  it('flat 은 9~18시 최대·최소 차이 < 15 일 때만 true, 산내면 평일은 평평한 예시', () => {
    for (const id of DONG_MOCK_IDS) {
      const d = makeDongMock(id, '2025-06')
      for (const day of ['weekday', 'weekend'] as const) {
        const day9to18 = d.hourly[day].slice(9, 19)
        expect(d.peaks[day].flat).toBe(Math.max(...day9to18) - Math.min(...day9to18) < 15)
      }
    }
    expect(makeDongMock('5214036000', '2025-10').peaks.weekday.flat).toBe(true)
    expect(makeDongMock('5214036000', '2025-10').peaks.weekend.flat).toBe(false)
    expect(GEOJIN_2025_10.peaks.weekday.flat).toBe(false)
  })
})
