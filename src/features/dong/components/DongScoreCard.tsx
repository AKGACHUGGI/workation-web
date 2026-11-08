import { DONG_COPY } from '@/features/dong/copy'
import { formatHour } from '@/features/dong/summary'
import type { DongDetailResponse } from '@/features/dong/types'
import { METRIC_LABEL } from '@/features/metric/constants'
import { monthLabel } from '@/features/metric/month'
import type { MonthParam } from '@/features/metric/month'
import type { Grade } from '@/features/metric/types'
import ScoreCard from '@/features/region/components/ScoreCard'

type Props = {
  detail: DongDetailResponse
  month: MonthParam
  /** tier dong 응답에서 rankIn 으로 계산. 특수시설 동이면 null */
  quiet: { score: number; grade: Grade; total: number } | null
  vibeGrade: Grade | null
  peerGrade: Grade | null
}

/** Figma 251:3713 '§ 한적함 점수' — W-03 ScoreCard 와 같은 가운데 정렬 점수 블록 */
export default function DongScoreCard({ detail, month, quiet, vibeGrade, peerGrade }: Props) {
  return (
    <ScoreCard
      ariaLabel="동네 조용함 점수"
      testId="quiet-score"
      score={quiet ? quiet.score : null}
      headline={
        quiet ? (
          `${METRIC_LABEL.quiet} · 행정동 ${quiet.total}곳 중 백분위 ${Math.round(quiet.score)} · ${quiet.grade}`
        ) : (
          <span className="text-text-secondary">{DONG_COPY.specialBadge}</span>
        )
      }
      detail={`${monthLabel(month)} 기준 · ${METRIC_LABEL.vibe} ${vibeGrade ?? '—'} · ${METRIC_LABEL.peer} ${peerGrade ?? '—'} · 생활권 지수 ${detail.stats.localLife}`}
      summary={[
        { label: '주중 피크', value: formatHour(detail.peaks.weekday.peakHour) },
        { label: '가장 한산', value: formatHour(detail.peaks.weekday.lowHour) },
        { label: '낮 유입 지수', value: detail.stats.dayInflow.toFixed(2) },
        { label: '생활권 지수', value: String(detail.stats.localLife) },
      ]}
    />
  )
}
