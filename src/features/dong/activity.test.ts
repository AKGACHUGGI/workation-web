import { describe, expect, it } from 'vitest'
import { dominantActivity, normalizeActivityMix, sortedActivities } from '@/features/dong/activity'

const geojin = { eveningDowntown: 25, weekendTourist: 32, weekdayWork: 24, dawnResidential: 19 }

describe('dominantActivity', () => {
  it('최대 비중 키', () => {
    expect(dominantActivity(geojin)).toBe('weekendTourist')
  })
})

describe('normalizeActivityMix', () => {
  it('합 100 으로 정규화하고 정수 반올림', () => {
    const out = normalizeActivityMix({
      eveningDowntown: 0.5,
      weekendTourist: 0.64,
      weekdayWork: 0.48,
      dawnResidential: 0.38,
    })
    expect(out).toEqual({
      eveningDowntown: 25,
      weekendTourist: 32,
      weekdayWork: 24,
      dawnResidential: 19,
    })
  })
  it('반올림으로 합이 어긋나면 최대 항목에서 보정한다', () => {
    // 33.4 / 33.3 / 33.3 → 33/33/33 = 99 → 최대 항목 +1
    const out = normalizeActivityMix({
      eveningDowntown: 33.4,
      weekendTourist: 33.3,
      weekdayWork: 33.3,
      dawnResidential: 0,
    })
    expect(out.eveningDowntown + out.weekendTourist + out.weekdayWork + out.dawnResidential).toBe(
      100,
    )
    expect(out.eveningDowntown).toBe(34)
  })
  it('모두 0 이면 균등 25', () => {
    expect(
      normalizeActivityMix({
        eveningDowntown: 0,
        weekendTourist: 0,
        weekdayWork: 0,
        dawnResidential: 0,
      }),
    ).toEqual({
      eveningDowntown: 25,
      weekendTourist: 25,
      weekdayWork: 25,
      dawnResidential: 25,
    })
  })
})

describe('sortedActivities', () => {
  it('내림차순, 동점은 ACTIVITY_KEYS 순서', () => {
    expect(sortedActivities(geojin).map((e) => e.key)).toEqual([
      'weekendTourist',
      'eveningDowntown',
      'weekdayWork',
      'dawnResidential',
    ])
  })
})
