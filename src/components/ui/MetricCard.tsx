import GradeBadge from '@/components/ui/GradeBadge'
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

/**
 * Figma MetricCard 7:162. rounded-xl · 1px 헤어라인 · p 16 · gap 8.
 * 라벨 14 Medium 보조색 + 등급 배지(sm) / 점수 24 Bold 잉크 + "점" 14 tertiary / 부제 12 tertiary.
 * 점수 색은 등급색이 아니라 잉크(디자인 원칙 2: 점수·순위는 잉크).
 */
export default function MetricCard({
  metric,
  score,
  grade,
  subtitle,
  compact = false,
  label,
}: Props) {
  const pad = compact ? 'gap-1 p-3' : 'gap-2 p-4'
  const number = compact ? 'text-title-md font-bold' : 'text-number-2xl'
  const title = compact ? 'text-caption-segment' : 'text-body-sm font-medium'
  return (
    <div className={`border-border-default bg-bg-surface flex flex-col rounded-xl border ${pad}`}>
      <div className="flex items-center justify-between">
        <span className={`${title} text-text-secondary`}>{label ?? METRIC_LABEL[metric]}</span>
        {grade && <GradeBadge grade={grade} size="sm" />}
      </div>
      {score === null || grade === null ? (
        <span className={`${number} text-text-tertiary`}>—</span>
      ) : (
        <span className="flex items-end gap-0.5">
          <span className={`${number} text-text-primary`}>{Math.round(score)}</span>
          <span className="text-body-sm text-text-tertiary">점</span>
        </span>
      )}
      {subtitle && <span className="text-caption-xs text-text-tertiary">{subtitle}</span>}
    </div>
  )
}
