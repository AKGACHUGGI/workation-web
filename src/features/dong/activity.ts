import { ACTIVITY_KEYS } from '@/features/dong/types'
import type { ActivityKey } from '@/features/dong/types'

export const ACTIVITY_LABEL: Record<ActivityKey, string> = {
  eveningDowntown: '저녁 상권형',
  weekendTourist: '주말 관광형',
  weekdayWork: '평일 업무형',
  dawnResidential: '새벽 주거형',
}

/** Recharts·인라인 스타일용 CSS 변수. 순서는 ACTIVITY_KEYS = chart-1..4 */
export const ACTIVITY_COLOR: Record<ActivityKey, string> = {
  eveningDowntown: 'var(--color-chart-1)',
  weekendTourist: 'var(--color-chart-2)',
  weekdayWork: 'var(--color-chart-3)',
  dawnResidential: 'var(--color-chart-4)',
}

/** Tailwind 배경 클래스 (범례 점·막대 조각) */
export const ACTIVITY_BG_CLASS: Record<ActivityKey, string> = {
  eveningDowntown: 'bg-chart-1',
  weekendTourist: 'bg-chart-2',
  weekdayWork: 'bg-chart-3',
  dawnResidential: 'bg-chart-4',
}

/** 최대 비중 키. 동점이면 ACTIVITY_KEYS 앞쪽 */
export function dominantActivity(mix: Record<ActivityKey, number>): ActivityKey {
  let best: ActivityKey = ACTIVITY_KEYS[0]
  for (const key of ACTIVITY_KEYS) if (mix[key] > mix[best]) best = key
  return best
}

/** 비중을 합 100 정수로. 반올림 오차는 최대 항목에서 보정 */
export function normalizeActivityMix(
  raw: Record<ActivityKey, number>,
): Record<ActivityKey, number> {
  const total = ACTIVITY_KEYS.reduce((s, k) => s + raw[k], 0)
  if (total <= 0) {
    return { eveningDowntown: 25, weekendTourist: 25, weekdayWork: 25, dawnResidential: 25 }
  }
  const out = { eveningDowntown: 0, weekendTourist: 0, weekdayWork: 0, dawnResidential: 0 }
  for (const k of ACTIVITY_KEYS) out[k] = Math.round((raw[k] / total) * 100)
  const sum = ACTIVITY_KEYS.reduce((s, k) => s + out[k], 0)
  if (sum !== 100) out[dominantActivity(out)] += 100 - sum
  return out
}

/** 내림차순 정렬. 동점은 ACTIVITY_KEYS 순서 유지 */
export function sortedActivities(
  mix: Record<ActivityKey, number>,
): { key: ActivityKey; value: number }[] {
  return ACTIVITY_KEYS.map((key) => ({ key, value: mix[key] })).sort((a, b) => b.value - a.value)
}
