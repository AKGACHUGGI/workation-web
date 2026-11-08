import GradeBadge from '@/components/ui/GradeBadge'
import { GRADE_FG } from '@/components/ui/gradeClass'
import { METRIC_LABEL } from '@/features/metric/constants'
import type { Grade, MetricKey } from '@/features/metric/types'

type Props = {
  metric: MetricKey
  /** 0~100 */
  score: number
  grade: Grade
  /** 부제 한 줄 (페이지별 산출 근거) */
  subtitle?: string
}

/** 지표 카드: 라벨 · 점수(정수) · 등급 배지 · 부제 */
export default function MetricCard({ metric, score, grade, subtitle }: Props) {
  return (
    <div className="border-border-default bg-bg-surface flex flex-col gap-2 rounded-xl border p-4">
      <div className="flex items-center justify-between">
        <span className="text-body-sm text-text-secondary font-medium">{METRIC_LABEL[metric]}</span>
        <GradeBadge grade={grade} size="sm" />
      </div>
      <span className={`text-number-2xl ${GRADE_FG[grade]}`}>{Math.round(score)}</span>
      {subtitle && <span className="text-caption-xs text-text-tertiary">{subtitle}</span>}
    </div>
  )
}
