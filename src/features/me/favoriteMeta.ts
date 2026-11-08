import type { FavoriteRegion } from '@/features/me/types'
import { PRESET_WEIGHTS } from '@/features/metric/constants'
import { monthLabel } from '@/features/metric/month'
import type { MonthParam } from '@/features/metric/month'
import { metricGrade } from '@/features/metric/score'
import type { MetricKey, PresetKey, Weights } from '@/features/metric/types'
import { customWeights } from '@/features/tier/buildTiers'

/** 카드 Meta2: 메모 → 방문 예정 월 → 시기 여유 */
export function favoriteMeta2(r: FavoriteRegion, month: MonthParam): string {
  if (r.note) return r.note
  if (r.visitMonth) return `${monthLabel(r.visitMonth)} 방문 예정`
  return `${monthLabel(month)} 시기 여유 ${metricGrade(r.scores.crowd)} · 혼잡 ${r.scores.crowd}`
}

/** preset 쿼리 → 가중치. custom 인데 metrics 가 없으면 조용한 곳 */
export function weightsFor(preset: PresetKey, metrics: MetricKey[] | null): Weights {
  if (preset === 'custom') return customWeights(metrics ?? ['quiet', 'crowd', 'overnight'])
  return PRESET_WEIGHTS[preset]
}
