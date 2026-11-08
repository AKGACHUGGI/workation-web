import { X } from 'lucide-react'
import { Link } from 'react-router-dom'
import MetricCard from '@/components/ui/MetricCard'
import Tag from '@/components/ui/Tag'
import ColumnSkeleton from '@/features/compare/components/ColumnSkeleton'
import { COMPARE_COPY, shortMetricCopy } from '@/features/compare/copy'
import { dominantActivity } from '@/features/dong/activity'
import HourlyCurveChart from '@/features/dong/components/HourlyCurveChart'
import { buildDongSummary, localLifeGrade } from '@/features/dong/summary'
import type { DongDetailResponse } from '@/features/dong/types'
import { metricGrade } from '@/features/metric/score'
import { DONG_KIND_LABEL } from '@/features/region/copy'
import type { TierItem } from '@/features/tier/types'
import { useCarryLink } from '@/hooks/useCarryLink'
import { useElementWidth } from '@/hooks/useElementWidth'

type Props = {
  id: string
  detail?: DongDetailResponse
  /** tier dong 응답의 같은 id 항목. 티어 응답 후에도 없으면(조회 실패) 티어 지표 '—' */
  tierItem?: TierItem
  /** tier dong 응답 대기 중. 이때는 열 전체를 스켈레톤으로 둔다 */
  tierPending: boolean
  rank: { rank: number; total: number } | null
  isPending: boolean
  isError: boolean
  onRetry: () => void
  onRemove: () => void
}

/** Figma W-05 v2 곡선 높이 150 + 축 라벨 */
const CHART_HEIGHT = 170
/** 측정 전 폭 (최소 1128px 본문 기준 열 안쪽 폭 근사) */
const CHART_FALLBACK_WIDTH = 300

/** 주중·주말 범례 (Figma 251:4118). 색은 HourlyCurveChart 의 선과 같다: 주중 chart/weekday(잉크) · 주말 chart/weekend(브랜드) */
function CurveLegend() {
  return (
    <div className="text-caption-xs text-text-secondary flex items-center gap-4">
      <span className="flex items-center gap-1.5">
        <span aria-hidden className="bg-chart-weekday h-0.75 w-4 rounded-xs" />
        주중
      </span>
      <span className="flex items-center gap-1.5">
        <span aria-hidden className="bg-chart-weekend h-0.75 w-4 rounded-xs" />
        주말
      </span>
    </div>
  )
}

/** 비교 열 1개 (Figma W-05 v2 251:4107): 헤더 · 범례+곡선(열 폭) · 지표 4종(세로) · 요약 */
export default function CompareColumn({
  id,
  detail,
  tierItem,
  tierPending,
  rank,
  isPending,
  isError,
  onRetry,
  onRemove,
}: Props) {
  const dongLink = useCarryLink(`/dongs/${id}`)
  const [chartRef, chartWidth] = useElementWidth<HTMLDivElement>(CHART_FALLBACK_WIDTH)

  if (isPending || tierPending) return <ColumnSkeleton />
  if (isError || !detail) {
    return (
      <div className="border-border-default flex min-h-96 flex-col items-center justify-center gap-3 rounded-xl border p-6">
        <p className="text-body-sm text-text-secondary">{COMPARE_COPY.columnError}</p>
        <button
          type="button"
          onClick={onRetry}
          className="border-border-default text-body-sm text-text-primary rounded-lg border px-4 py-2"
        >
          {COMPARE_COPY.retry}
        </button>
      </div>
    )
  }

  const scores = tierItem?.scores
  const quiet = scores?.quiet ?? null
  const vibe = scores?.vibe ?? null
  const peer = scores?.peer ?? null
  const gradeOf = (v: number | null) => (v === null ? null : metricGrade(v))
  const vibeGrade = gradeOf(vibe)
  const copy = shortMetricCopy(detail, rank)
  const summary = buildDongSummary({
    dominant: dominantActivity(detail.activityMix),
    weekdayPeakHour: detail.peaks.weekday.peakHour,
    // 티어 조회 실패로 활기 등급이 없으면 '저녁엔 일찍 조용해집니다' 쪽(낮은 등급)으로 둔다
    vibeGrade: vibeGrade ?? 'C',
    kind: detail.kind,
  })

  return (
    <article
      className="border-border-default bg-bg-surface flex min-w-0 flex-col gap-4 rounded-xl border p-5"
      aria-label={detail.name}
    >
      <header className="flex items-start justify-between gap-2">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <Link to={dongLink} className="text-heading-xl text-text-primary">
              {detail.name}
            </Link>
            <Tag>{DONG_KIND_LABEL[detail.kind]}</Tag>
          </div>
          <span className="text-caption-xs text-text-tertiary">
            {detail.province} {detail.sigungu.name}
          </span>
        </div>
        <button
          type="button"
          aria-label={`${detail.name} 제거`}
          onClick={onRemove}
          className="text-text-secondary hover:text-text-primary rounded-md"
        >
          <X size={18} aria-hidden />
        </button>
      </header>

      <div className="flex flex-col gap-2">
        <CurveLegend />
        {/* 고정 폭 차트를 열 안쪽 폭에 맞춘다 */}
        <div ref={chartRef} className="w-full">
          <HourlyCurveChart
            hourly={detail.hourly}
            day="weekday"
            compact
            height={CHART_HEIGHT}
            width={chartWidth}
          />
        </div>
      </div>

      <div className="flex flex-col gap-4">
        <MetricCard metric="quiet" score={quiet} grade={gradeOf(quiet)} subtitle={copy.quiet} />
        <MetricCard metric="vibe" score={vibe} grade={vibeGrade} subtitle={copy.vibe} />
        <MetricCard metric="peer" score={peer} grade={gradeOf(peer)} subtitle={copy.peer} />
        <MetricCard
          metric="quiet"
          label="생활권 지수"
          score={detail.stats.localLife}
          grade={localLifeGrade(detail.stats.localLife)}
          subtitle={copy.localLife}
        />
      </div>

      <p className="bg-bg-page text-body-sm text-text-secondary rounded-lg p-3">{summary}</p>
    </article>
  )
}
