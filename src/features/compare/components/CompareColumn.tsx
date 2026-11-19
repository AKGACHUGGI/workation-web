import { useRef, useState } from 'react'
import { X } from 'lucide-react'
import { Link } from 'react-router-dom'
import MetricCard from '@/components/ui/MetricCard'
import Tag from '@/components/ui/Tag'
import StayCurveChart from '@/features/compare/components/StayCurveChart'
import { COMPARE_COPY, shortMetricCopy } from '@/features/compare/copy'
import { stayAxisMax } from '@/features/compare/stayScale'
import { dominantActivity } from '@/features/dong/activity'
import { buildDongSummary, localLifeGrade } from '@/features/dong/summary'
import type { DayGroup, DongDetailResponse } from '@/features/dong/types'
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
  /** 곡선에 그릴 요일그룹. 페이지 헤더 토글이 모든 열에 같이 준다 */
  day?: DayGroup
  /** 열들이 함께 쓰는 체류 곡선 세로축 최대값. 없으면 이 열 값으로 정한다 */
  stayMax?: number | null
  /** 테스트에서 false */
  animate?: boolean
}

/** EmptyColumn 의 min-h-96 (24rem). 제거할 때 카드가 이 높이로 줄어들며 빈 칸이 된다 */
const EMPTY_COLUMN_HEIGHT = 384

/** Figma W-05 v2 곡선 높이 150 + 축 라벨 */
const CHART_HEIGHT = 170
/** 측정 전 폭 (최소 1128px 본문 기준 열 안쪽 폭 근사) */
const CHART_FALLBACK_WIDTH = 300

/** 범례: 지금 그린 요일그룹 한 줄. 색은 StayCurveChart 선과 같다 (주중 잉크 · 주말 브랜드) */
function CurveLegend({ day }: { day: DayGroup }) {
  return (
    <div className="text-caption-xs text-text-secondary flex items-center gap-1.5">
      <span
        aria-hidden
        className={`${day === 'weekday' ? 'bg-chart-weekday' : 'bg-chart-weekend'} h-0.75 w-4 rounded-xs`}
      />
      {COMPARE_COPY.stayLegend(day)}
      <span className="text-text-tertiary ml-auto">{COMPARE_COPY.stayUnit}</span>
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
  day = 'weekday',
  stayMax,
  animate,
}: Props) {
  const dongLink = useCarryLink(`/dongs/${id}`)
  const [chartRef, chartWidth, chartMeasured] =
    useElementWidth<HTMLDivElement>(CHART_FALLBACK_WIDTH)
  /** 제거 버튼을 누른 뒤 내려가며 사라지는 중. 애니메이션이 끝나면 onRemove */
  const [leaving, setLeaving] = useState(false)
  const articleRef = useRef<HTMLElement>(null)

  /**
   * 제거: 카드가 제자리에서 빈 칸(EmptyColumn)으로 바뀐다.
   * 내용이 흐려지고 테두리가 점선이 된 뒤, 높이가 빈 칸 높이로 줄어들면 목록에서 빼서 빈 칸과 바꾼다.
   * 동작 줄이기(또는 animate 없는 테스트 환경)면 바로 뺀다.
   */
  const removeWithMorph = () => {
    const el = articleRef.current
    const reduced = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? true
    if (reduced || !el?.animate) {
      onRemove()
      return
    }
    setLeaving(true)
    el.animate([{ height: `${el.offsetHeight}px` }, { height: `${EMPTY_COLUMN_HEIGHT}px` }], {
      duration: 460,
      delay: 140, // 내용이 먼저 흐려지고 나서 줄어든다
      easing: 'cubic-bezier(0.22, 1, 0.36, 1)',
      fill: 'forwards',
    }).finished.then(onRemove, () => {})
  }

  // 스켈레톤 없이 자리만 잡아 두고(빈 칸이 옆으로 밀리지 않게), 데이터가 오면 카드가 아래에서 올라온다
  if (isPending || tierPending) return <div data-testid="column-pending" aria-hidden />
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
      ref={articleRef}
      className={`bg-bg-surface flex min-w-0 flex-col gap-4 rounded-xl border p-5 ${
        leaving
          ? // 빈 칸으로 변신: 점선 테두리 + 내용 흐려짐, 높이는 morphToEmpty 가 줄인다
            'border-border-default pointer-events-none overflow-hidden border-dashed [&>*]:opacity-0 [&>*]:transition-opacity [&>*]:duration-200'
          : 'border-border-default motion-safe:animate-column-rise'
      }`}
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
          onClick={removeWithMorph}
          className="text-text-secondary hover:text-text-primary rounded-md"
        >
          <X size={18} aria-hidden />
        </button>
      </header>

      <div className="flex flex-col gap-2">
        <CurveLegend day={day} />
        {/* 고정 폭 차트를 열 안쪽 폭에 맞춘다. 폭을 잰 뒤에 그려야 선이 끝까지 이어 그려진다 */}
        <div ref={chartRef} className="w-full" style={{ height: CHART_HEIGHT }}>
          {chartMeasured && (
            <StayCurveChart
              values={detail.stayHourly[day]}
              day={day}
              yMax={stayMax ?? stayAxisMax(detail.stayHourly[day]) ?? 1}
              height={CHART_HEIGHT}
              width={chartWidth}
              animate={animate}
            />
          )}
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
