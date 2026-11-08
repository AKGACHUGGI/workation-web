import { MONTHS } from '@/features/metric/month'
import type { MonthParam } from '@/features/metric/month'

/** 곡선 섹션 월 칩: 선택 월 ±1 (양끝은 안쪽으로 밀어 3개 유지). 연간은 최근 3개월 */
export function monthWindow(month: MonthParam): MonthParam[] {
  const months = MONTHS.filter((m) => m !== 'annual') // 2025-01 .. 2025-12
  const last = months.length - 1
  let i = month === 'annual' ? last : months.indexOf(month)
  if (i < 0) i = last
  const start = Math.min(Math.max(i - 1, 0), last - 2)
  return months.slice(start, start + 3)
}
