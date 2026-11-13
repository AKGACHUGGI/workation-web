import type { DayGroup, HourlyDay } from '@/features/explore/types'

export type RingCell = { hour: number; value: number | null; intensity: number }

/**
 * ② 24시간 링 칸 (스펙 §7). intensity = 값 ÷ 이 동 평일·주말 48칸 최대.
 * 다른 동과 비교하지 않는다. null 은 0 (회색 표시)
 */
export function ringCells(hourly: Record<DayGroup, HourlyDay>, day: DayGroup): RingCell[] {
  const all = [...hourly.weekday.driv, ...hourly.weekend.driv].filter(
    (v): v is number => v !== null,
  )
  const max = all.length > 0 ? Math.max(...all) : 0
  return hourly[day].driv.map((value, hour) => ({
    hour,
    value,
    intensity: value === null || max === 0 ? 0 : value / max,
  }))
}
