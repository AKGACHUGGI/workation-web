import { METRIC_KEYS, PRESET_KEYS } from '@/features/metric/types'
import type { MetricKey, PresetKey } from '@/features/metric/types'

export const DEFAULT_PRESET: PresetKey = 'quiet'

export function parsePreset(raw: string | null): PresetKey | null {
  if (raw === null) return null
  return (PRESET_KEYS as readonly string[]).includes(raw) ? (raw as PresetKey) : null
}

function isMetricKey(v: string): v is MetricKey {
  return (METRIC_KEYS as readonly string[]).includes(v)
}

/** METRIC_KEYS 순서로 정렬 + 중복 제거 */
export function normalizeMetrics(keys: readonly MetricKey[]): MetricKey[] {
  return METRIC_KEYS.filter((k) => keys.includes(k))
}

/** 'vibe,quiet,quiet' → ['quiet','vibe']. 모르는 키가 있거나 비어 있으면 null */
export function parseMetrics(raw: string | null): MetricKey[] | null {
  if (!raw) return null
  const parts = raw.split(',').filter(Boolean)
  if (parts.length === 0 || !parts.every(isMetricKey)) return null
  return normalizeMetrics(parts)
}

export function serializeMetrics(keys: readonly MetricKey[]): string {
  return normalizeMetrics(keys).join(',')
}
