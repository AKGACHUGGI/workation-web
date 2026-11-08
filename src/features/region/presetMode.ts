import { METRIC_SHORT_LABEL, PRESET_LABEL, PRESET_WEIGHTS } from '@/features/metric/constants'
import { parseMetrics, serializeMetrics } from '@/features/metric/params'
import type { MetricKey } from '@/features/metric/types'
import { customWeights } from '@/features/tier/buildTiers'
import type { TierMode } from '@/features/tier/types'
import { usePresetParam, useQueryState } from '@/hooks/useQueryState'

/** W-02 와 같은 기본값 (직접 설정: 조용·시기·숙박) */
export const DEFAULT_CUSTOM_METRICS: MetricKey[] = ['quiet', 'crowd', 'overnight']

export type PresetMode = {
  mode: TierMode
  /** '조용한 곳' / '활기 있는 한 달' / '직접 설정 (조용 · 시기 · 숙박)' */
  presetLabel: string
  /** custom 일 때 고른 지표, 아니면 null */
  selected: MetricKey[] | null
}

/** preset·metrics 쿼리 → 밸류 탭 TierMode. W-03·W-04 PlanCard 가 공유한다. */
export function usePresetMode(): PresetMode {
  const [preset] = usePresetParam()
  const [metrics] = useQueryState<MetricKey[]>(
    'metrics',
    parseMetrics,
    DEFAULT_CUSTOM_METRICS,
    serializeMetrics,
  )
  if (preset === 'custom') {
    const short = metrics.map((k) => METRIC_SHORT_LABEL[k]).join(' · ')
    return {
      mode: { tab: 'value', weights: customWeights(metrics), selected: metrics },
      presetLabel: `${PRESET_LABEL.custom} (${short})`,
      selected: metrics,
    }
  }
  return {
    mode: { tab: 'value', weights: PRESET_WEIGHTS[preset] },
    presetLabel: PRESET_LABEL[preset],
    selected: null,
  }
}
