import { Fragment } from 'react'
import Chip from '@/components/ui/Chip'
import Tooltip from '@/components/ui/Tooltip'
import { METRIC_LABEL } from '@/features/metric/constants'
import { normalizeMetrics } from '@/features/metric/params'
import { METRIC_KEYS } from '@/features/metric/types'
import type { MetricKey } from '@/features/metric/types'

type Props = {
  selected: MetricKey[]
  onChange: (next: MetricKey[]) => void
}

/** 직접 설정: 지표 토글 5개. 선택한 지표만 같은 가중치. 최소 1개 */
export default function CustomMetricToggles({ selected, onChange }: Props) {
  return (
    <div role="group" aria-label="포함 지표" className="flex flex-wrap items-center gap-2">
      <span className="text-body-sm text-text-secondary">포함 지표</span>
      {METRIC_KEYS.map((key) => {
        const on = selected.includes(key)
        const locked = on && selected.length === 1
        const toggle = () =>
          onChange(on ? selected.filter((k) => k !== key) : normalizeMetrics([...selected, key]))
        const chip = (
          <Chip size="md" selected={on} disabled={locked} onClick={toggle}>
            {METRIC_LABEL[key]}
          </Chip>
        )
        return (
          <Fragment key={key}>
            {locked ? <Tooltip content="최소 1개 지표가 필요합니다">{chip}</Tooltip> : chip}
          </Fragment>
        )
      })}
      <span className="text-caption-xs text-text-tertiary">
        선택한 지표만 같은 가중치로 평균합니다 · {selected.length}개 선택
      </span>
    </div>
  )
}
