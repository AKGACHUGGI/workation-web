import GradeBadge from '@/components/ui/GradeBadge'
import Tooltip from '@/components/ui/Tooltip'
import { METRIC_SHORT_LABEL } from '@/features/metric/constants'
import { metricGrade } from '@/features/metric/score'
import { METRIC_KEYS } from '@/features/metric/types'
import type { MetricKey, MetricScores } from '@/features/metric/types'

type Props = {
  scores: MetricScores
  /** 직접 설정에서 고른 지표. null/undefined 면 흐림 없음 */
  selected?: MetricKey[] | null
  /** 상위 단위 값을 물려받은 지표 → 툴팁 "시군구 산출값" */
  inherited?: MetricKey[]
}

/** 카드 세부 등급: 조용·시기·또래·숙박·활기 + metricGrade 배지 (Figma SubGrades: 줄 간격 4 · 쌍 간격 8 · 라벨-배지 3) */
export default function SubGradeChips({ scores, selected = null, inherited = [] }: Props) {
  return (
    <ul aria-label="세부 등급" className="flex flex-wrap gap-x-2 gap-y-1">
      {METRIC_KEYS.map((key) => {
        const dim = selected !== null && !selected.includes(key)
        const isInherited = inherited.includes(key)
        const chip = (
          <span
            data-metric={key}
            data-dim={dim || undefined}
            tabIndex={isInherited ? 0 : undefined}
            className={`inline-flex items-center gap-0.75 ${dim ? 'opacity-dim' : ''}`}
          >
            <span className="text-caption-xs text-text-secondary">{METRIC_SHORT_LABEL[key]}</span>
            <GradeBadge grade={metricGrade(scores[key])} size="sm" />
          </span>
        )
        return (
          <li key={key}>
            {isInherited ? <Tooltip content="시군구 산출값">{chip}</Tooltip> : chip}
          </li>
        )
      })}
    </ul>
  )
}
