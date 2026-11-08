import MetricCard from '@/components/ui/MetricCard'
import GradeBadge from '@/components/ui/GradeBadge'
import { GRADE_FG } from '@/components/ui/gradeClass'
import { DONG_COPY } from '@/features/dong/copy'
import { localLifeGrade, localLifeLabel } from '@/features/dong/summary'
import type { DongDetailResponse } from '@/features/dong/types'
import { monthLabel } from '@/features/metric/month'
import type { MonthParam } from '@/features/metric/month'
import { metricGrade } from '@/features/metric/score'
import type { MetricScores } from '@/features/metric/types'

type Props = {
  detail: DongDetailResponse
  month: MonthParam
  /** tier dong 응답의 scores. 특수시설 동이면 null (카드 3개는 "—") */
  scores: MetricScores | null
  total: number
  excluded: number
}

export default function DongMetricGrid({ detail, month, scores, total, excluded }: Props) {
  const s = detail.stats
  const lifeGrade = localLifeGrade(s.localLife)
  return (
    <section aria-labelledby="metric-title" className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h2 id="metric-title" className="text-heading-lg text-text-primary">
          {DONG_COPY.metricTitle}
        </h2>
        <span className="text-caption-xs text-text-tertiary">
          {DONG_COPY.metricCaption(monthLabel(month), total, excluded)}
        </span>
      </div>
      <div className="grid grid-cols-4 gap-4">
        {scores ? (
          <>
            <MetricCard
              metric="quiet"
              score={scores.quiet}
              grade={metricGrade(scores.quiet)}
              subtitle={`낮 유입 지수 ${s.dayInflow.toFixed(2)} · 백분위 ${Math.round(scores.quiet)}`}
            />
            <MetricCard
              metric="vibe"
              score={scores.vibe}
              grade={metricGrade(scores.vibe)}
              subtitle={`저녁 유동 ÷ 체류 ${s.eveningVibe.toFixed(2)} · 규모 대비 ${s.eveningSurplus.toFixed(2)}배`}
            />
            <MetricCard
              metric="peer"
              score={scores.peer}
              grade={metricGrade(scores.peer)}
              subtitle={`20~40대 방문 비율 ${s.peerShare}%`}
            />
          </>
        ) : (
          ['quiet', 'vibe', 'peer'].map((k) => (
            <div
              key={k}
              className="border-border-default bg-bg-surface text-text-tertiary rounded-xl border p-4"
            >
              <span className="text-body-sm">{DONG_COPY.specialBadge}</span>
            </div>
          ))
        )}
        {/* 생활권 지수는 티어 지표가 아니라 상세 응답 값 + 고정 경계 */}
        <div className="border-border-default bg-bg-surface flex flex-col gap-2 rounded-xl border p-4">
          <div className="flex items-center justify-between">
            <span className="text-body-sm text-text-secondary font-medium">생활권 지수</span>
            <GradeBadge grade={lifeGrade} size="sm" />
          </div>
          <span className={`text-number-2xl ${GRADE_FG[lifeGrade]}`}>{s.localLife}</span>
          <span className="text-caption-xs text-text-tertiary">
            (거주+근무) ÷ 전체 {s.localLife}% · {localLifeLabel(s.localLife)}
          </span>
        </div>
      </div>
    </section>
  )
}
