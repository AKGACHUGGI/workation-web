import GradeBadge from '@/components/ui/GradeBadge'
import { GRADE_FG } from '@/components/ui/gradeClass'
import { METRIC_LABEL } from '@/features/metric/constants'
import type { Grade, MetricKey } from '@/features/metric/types'

type Props = {
  metric: MetricKey
  /** 0~100. null 이면 "—" (값 없음) */
  score: number | null
  grade: Grade | null
  /** 부제 한 줄 (페이지별 산출 근거) */
  subtitle?: string
  /** W-05 비교 열용: 작은 패딩·작은 숫자 */
  compact?: boolean
  /** METRIC_LABEL 대신 쓸 라벨 (생활권 지수처럼 티어 지표가 아닌 카드) */
  label?: string
}

/** 지표 카드: 라벨 · 점수(정수) · 등급 배지 · 부제 */
export default function MetricCard({
  metric,
  score,
  grade,
  subtitle,
  compact = false,
  label,
}: Props) {
  const pad = compact ? 'gap-1 p-3' : 'gap-2 p-4'
  const number = compact ? 'text-title-md' : 'text-number-2xl'
  const title = compact ? 'text-caption-xs' : 'text-body-sm'
  return (
    <div className={`border-border-default bg-bg-surface flex flex-col rounded-xl border ${pad}`}>
      <div className="flex items-center justify-between">
        <span className={`${title} text-text-secondary font-medium`}>
          {label ?? METRIC_LABEL[metric]}
        </span>
        {grade && <GradeBadge grade={grade} size="sm" />}
      </div>
      {score === null || grade === null ? (
        <span className={`${number} text-text-tertiary`}>—</span>
      ) : (
        <span className={`${number} ${GRADE_FG[grade]}`}>{Math.round(score)}</span>
      )}
      {subtitle && <span className="text-caption-xs text-text-tertiary">{subtitle}</span>}
    </div>
  )
}
