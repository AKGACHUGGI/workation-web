import Segmented from '@/components/ui/Segmented'
import type { SegmentedOption } from '@/components/ui/Segmented'
import { METRIC_GROUP, METRIC_GROUP_LABEL, METRIC_LABEL } from '@/features/metric/constants'
import type { MetricKey } from '@/features/metric/types'
import type { TierScope } from '@/features/tier/types'

type Props = { metric: MetricKey; scope: TierScope; onChange: (metric: MetricKey) => void }

const CHARACTER: MetricKey[] = ['quiet', 'peer', 'vibe']
const TIMING: MetricKey[] = ['crowd', 'overnight']
const OVERNIGHT_DISABLED =
  '숙박 성향은 시군구 단위로 산출되는 지표로, 행정동 간 비교는 제공하지 않습니다.'

/** 개별 지표 두 그룹. 하나의 metric 값을 공유하고, 선택되지 않은 그룹은 선택 표시 없음 */
export default function MetricGroupTabs({ metric, scope, onChange }: Props) {
  const options = (keys: MetricKey[]): SegmentedOption<MetricKey>[] =>
    keys.map((key) => {
      const disabled = key === 'overnight' && scope === 'dong'
      return {
        value: key,
        label: METRIC_LABEL[key],
        disabled,
        title: disabled ? OVERNIGHT_DISABLED : undefined,
      }
    })
  return (
    <div className="flex items-center gap-6">
      <div className="flex items-center gap-2">
        <span className="text-body-sm text-text-secondary">{METRIC_GROUP_LABEL.character}</span>
        <Segmented
          ariaLabel={METRIC_GROUP_LABEL.character}
          options={options(CHARACTER)}
          value={METRIC_GROUP[metric] === 'character' ? metric : null}
          onChange={onChange}
        />
      </div>
      <div className="flex items-center gap-2">
        <span className="text-body-sm text-text-secondary">{METRIC_GROUP_LABEL.timing}</span>
        <Segmented
          ariaLabel={METRIC_GROUP_LABEL.timing}
          options={options(TIMING)}
          value={METRIC_GROUP[metric] === 'timing' ? metric : null}
          onChange={onChange}
        />
      </div>
    </div>
  )
}
