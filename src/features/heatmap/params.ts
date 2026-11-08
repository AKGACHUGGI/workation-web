import { HEAT_METRICS } from '@/features/heatmap/types'
import type { HeatMetric } from '@/features/heatmap/types'
import type { TierScope } from '@/features/tier/types'

export const DEFAULT_HEAT_METRIC: HeatMetric = 'value'
export const DEFAULT_SCOPE: TierScope = 'sigungu'

export function parseHeatMetric(raw: string | null): HeatMetric | null {
  if (raw === null) return null
  return (HEAT_METRICS as readonly string[]).includes(raw) ? (raw as HeatMetric) : null
}

export function parseScope(raw: string | null): TierScope | null {
  return raw === 'sigungu' || raw === 'dong' ? raw : null
}

/** sgg: 아무 문자열이나 받되 응답에 없는 id 는 호출부에서 무시한다 */
export function parseSgg(raw: string | null): string | null {
  return raw && raw.length > 0 ? raw : null
}
