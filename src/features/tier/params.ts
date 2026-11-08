import { parseMetrics, serializeMetrics } from '@/features/metric/params'
import { METRIC_KEYS } from '@/features/metric/types'
import type { MetricKey } from '@/features/metric/types'
import type { TierScope, TierTab } from '@/features/tier/types'

/** 직접 설정 기본 선택 (스펙 §4) */
export const DEFAULT_METRICS: MetricKey[] = ['quiet', 'crowd', 'overnight']

export function parseTab(raw: string | null): TierTab | null {
  return raw === 'value' || raw === 'metric' ? raw : null
}

export function parseScope(raw: string | null): TierScope | null {
  return raw === 'sigungu' || raw === 'dong' ? raw : null
}

export function parseMetricKey(raw: string | null): MetricKey | null {
  return raw !== null && (METRIC_KEYS as readonly string[]).includes(raw)
    ? (raw as MetricKey)
    : null
}

/** 'all' 또는 시군구 코드 5자리. 응답에 없는 id 는 페이지가 데이터를 받은 뒤 'all' 로 고친다 */
export function parseSgg(raw: string | null): string | null {
  return raw === 'all' || (raw !== null && /^\d{5}$/.test(raw)) ? raw : null
}

/** 값 자체는 유효하지만 조합·표기를 고쳐야 하는 경우. 고칠 게 없으면 null */
export function correctTierParams(sp: URLSearchParams): URLSearchParams | null {
  const next = new URLSearchParams(sp)
  let changed = false
  if (sp.get('scope') === 'dong' && sp.get('metric') === 'overnight') {
    next.set('metric', 'quiet')
    changed = true
  }
  const raw = sp.get('metrics')
  const parsed = parseMetrics(raw)
  if (raw !== null && parsed !== null && serializeMetrics(parsed) !== raw) {
    next.set('metrics', serializeMetrics(parsed))
    changed = true
  }
  return changed ? next : null
}
