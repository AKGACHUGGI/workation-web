import GradeBadge from '@/components/ui/GradeBadge'
import { GRADE_FG } from '@/components/ui/gradeClass'
import { DONG_COPY } from '@/features/dong/copy'
import { formatHour } from '@/features/dong/summary'
import type { DongDetailResponse } from '@/features/dong/types'
import { METRIC_LABEL } from '@/features/metric/constants'
import { monthLabel } from '@/features/metric/month'
import type { MonthParam } from '@/features/metric/month'
import type { Grade } from '@/features/metric/types'

type Props = {
  detail: DongDetailResponse
  month: MonthParam
  /** tier dong 응답에서 rankIn 으로 계산. 특수시설 동이면 null */
  quiet: { score: number; grade: Grade; total: number } | null
  vibeGrade: Grade | null
  peerGrade: Grade | null
}

export default function DongScoreCard({ detail, month, quiet, vibeGrade, peerGrade }: Props) {
  const cells = [
    { label: '주중 피크', value: formatHour(detail.peaks.weekday.peakHour) },
    { label: '가장 한산', value: formatHour(detail.peaks.weekday.lowHour) },
    { label: '낮 유입 지수', value: detail.stats.dayInflow.toFixed(2) },
    { label: '생활권 지수', value: String(detail.stats.localLife) },
  ]
  return (
    <section
      aria-label="동네 조용함 점수"
      className="border-border-default bg-bg-surface flex flex-col gap-4 rounded-2xl border p-6"
    >
      <div className="flex items-end gap-4">
        {quiet ? (
          <span className={`text-number-rating ${GRADE_FG[quiet.grade]}`} data-testid="quiet-score">
            {Math.round(quiet.score)}
          </span>
        ) : (
          <span className="text-number-rating text-text-tertiary">—</span>
        )}
        <div className="flex flex-col gap-1 pb-3">
          {quiet ? (
            <p className="text-title-md text-text-primary flex items-center gap-2">
              {METRIC_LABEL.quiet} · 행정동 {quiet.total}곳 중 백분위 {Math.round(quiet.score)} ·{' '}
              <GradeBadge grade={quiet.grade} />
            </p>
          ) : (
            <p className="text-title-md text-text-secondary">{DONG_COPY.specialBadge}</p>
          )}
          <p className="text-body-sm text-text-secondary">
            {monthLabel(month)} 기준 · {METRIC_LABEL.vibe} {vibeGrade ?? '—'} · {METRIC_LABEL.peer}{' '}
            {peerGrade ?? '—'} · 생활권 지수 {detail.stats.localLife}
          </p>
        </div>
      </div>
      <dl className="grid grid-cols-4 gap-4">
        {cells.map((c) => (
          <div key={c.label} className="bg-bg-subtle flex flex-col gap-1 rounded-xl p-4">
            <dt className="text-caption-xs text-text-tertiary">{c.label}</dt>
            <dd className="text-number-2xl text-text-primary">{c.value}</dd>
          </div>
        ))}
      </dl>
    </section>
  )
}
