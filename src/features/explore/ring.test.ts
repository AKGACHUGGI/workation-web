import { describe, expect, it } from 'vitest'
import { ringCells } from '@/features/explore/ring'
import type { HourlyDay } from '@/features/explore/types'
import { JUMUNJIN_DETAIL } from '@/mocks/explore/dong'

const day = (driv: (number | null)[]): HourlyDay => ({ driv, peakHour: null, quietHour: null })

describe('ringCells', () => {
  it('24칸, intensity 는 평일·주말 48칸 최대 기준 (이 동 하루 기준)', () => {
    const weekday = ringCells(JUMUNJIN_DETAIL.hourly, 'weekday')
    const weekend = ringCells(JUMUNJIN_DETAIL.hourly, 'weekend')
    expect(weekday).toHaveLength(24)
    // 48칸 최대 = 주말 14시 2833
    expect(weekend[14]).toEqual({ hour: 14, value: 2833, intensity: 1 })
    expect(weekday[12].intensity).toBeCloseTo(2064 / 2833)
    expect(Math.max(...weekday.map((c) => c.intensity))).toBeLessThan(1)
  })
  it('null 은 intensity 0, value null', () => {
    const cells = ringCells(
      { weekday: day([null, 50, ...Array(22).fill(10)]), weekend: day(Array(24).fill(100)) },
      'weekday',
    )
    expect(cells[0]).toEqual({ hour: 0, value: null, intensity: 0 })
    expect(cells[1].intensity).toBe(0.5)
  })
  it('값이 모두 없으면 모두 0', () => {
    const empty = day(Array(24).fill(null))
    expect(
      ringCells({ weekday: empty, weekend: empty }, 'weekend').every((c) => c.intensity === 0),
    ).toBe(true)
  })
})
