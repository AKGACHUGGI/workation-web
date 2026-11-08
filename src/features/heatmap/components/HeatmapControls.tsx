import Chip from '@/components/ui/Chip'
import Segmented from '@/components/ui/Segmented'
import { HEAT_METRICS, HEAT_METRIC_LABEL } from '@/features/heatmap/types'
import type { HeatMetric } from '@/features/heatmap/types'
import type { TierScope } from '@/features/tier/types'

type Props = {
  scope: TierScope
  onScopeChange: (s: TierScope) => void
  metric: HeatMetric
  onMetricChange: (m: HeatMetric) => void
}

export default function HeatmapControls({ scope, onScopeChange, metric, onMetricChange }: Props) {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <h2 className="text-heading-lg text-text-primary">지도 히트맵</h2>
        <Segmented
          ariaLabel="히트맵 범위"
          size="sm"
          options={[
            { value: 'sigungu', label: '시군구' },
            { value: 'dong', label: '행정동' },
          ]}
          value={scope}
          onChange={onScopeChange}
        />
      </div>
      <div className="flex items-center gap-2">
        {HEAT_METRICS.map((m) => (
          <Chip key={m} selected={metric === m} onClick={() => onMetricChange(m)}>
            {HEAT_METRIC_LABEL[m]}
          </Chip>
        ))}
      </div>
    </div>
  )
}
