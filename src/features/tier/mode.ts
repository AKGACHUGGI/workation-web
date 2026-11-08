import { PRESET_WEIGHTS } from '@/features/metric/constants'
import type { MetricKey, PresetKey } from '@/features/metric/types'
import { customWeights } from '@/features/tier/buildTiers'
import type { TierMode, TierTab } from '@/features/tier/types'

/** URL 상태 → 등급 계산 모드 */
export function toTierMode(
  tab: TierTab,
  preset: PresetKey,
  metrics: MetricKey[],
  metric: MetricKey,
): TierMode {
  if (tab === 'metric') return { tab: 'metric', metric }
  if (preset === 'custom')
    return { tab: 'value', weights: customWeights(metrics), selected: metrics }
  return { tab: 'value', weights: PRESET_WEIGHTS[preset] }
}
