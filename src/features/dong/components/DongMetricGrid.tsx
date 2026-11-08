import MetricCard from '@/components/ui/MetricCard'
import { DONG_COPY } from '@/features/dong/copy'
import { localLifeGrade, localLifeLabel } from '@/features/dong/summary'
import type { DongDetailResponse } from '@/features/dong/types'
import { monthLabel } from '@/features/metric/month'
import type { MonthParam } from '@/features/metric/month'
import { metricGrade } from '@/features/metric/score'
import type { MetricScores } from '@/features/metric/types'
import DetailSection from '@/features/region/components/DetailSection'

type Props = {
  detail: DongDetailResponse
  month: MonthParam
  /** tier dong 응답의 scores. 특수시설 동이면 null (카드 3개는 "—") */
  scores: MetricScores | null
  total: number
  excluded: number
}

/** Figma 251:3794 '동네 지표 4종' */
export default function DongMetricGrid({ detail, month, scores, total, excluded }: Props) {
  const s = detail.stats
  return (
    <DetailSection
      title={`${DONG_COPY.metricTitle} 4종`}
      titleId="metric-title"
      caption={DONG_COPY.metricCaption(monthLabel(month), total, excluded)}
    >
      <div className="grid grid-cols-4 items-start gap-4">
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
        {/* 생활권 지수는 티어 지표가 아니라 상세 응답 값 + 고정 경계. 모양은 MetricCard(label 덮어쓰기) */}
        <MetricCard
          metric="quiet"
          label="생활권 지수"
          score={s.localLife}
          grade={localLifeGrade(s.localLife)}
          subtitle={`(거주+근무) ÷ 전체 ${s.localLife}% · ${localLifeLabel(s.localLife)}`}
        />
      </div>
    </DetailSection>
  )
}
