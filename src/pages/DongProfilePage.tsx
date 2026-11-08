import { useCallback } from 'react'
import { ChevronRight } from 'lucide-react'
import { Link, useParams } from 'react-router-dom'
import PageContainer from '@/components/layout/PageContainer'
import { ACTIVITY_LABEL, dominantActivity } from '@/features/dong/activity'
import ActivityMixBar from '@/features/dong/components/ActivityMixBar'
import DongHero from '@/features/dong/components/DongHero'
import DongMap from '@/features/dong/components/DongMap'
import DongMetricGrid from '@/features/dong/components/DongMetricGrid'
import DongPlanCard from '@/features/dong/components/DongPlanCard'
import DongScoreCard from '@/features/dong/components/DongScoreCard'
import DongSkeleton from '@/features/dong/components/DongSkeleton'
import HourlyCurveSection from '@/features/dong/components/HourlyCurveSection'
import QuieterTwinsSection from '@/features/dong/components/QuieterTwinsSection'
import { DONG_COPY } from '@/features/dong/copy'
import { buildDongSummary, pollQuestion } from '@/features/dong/summary'
import { useDongNotesQuery } from '@/features/dong/useDongNotesQuery'
import { useDongPollQuery } from '@/features/dong/useDongPollQuery'
import { useDongQuery } from '@/features/dong/useDongQuery'
import { useGeoQuery } from '@/features/dong/useGeoQuery'
import { metricGrade } from '@/features/metric/score'
import type { Grade } from '@/features/metric/types'
import NoteSection from '@/features/region/components/NoteSection'
import DetailSection from '@/features/region/components/DetailSection'
import PollSection from '@/features/region/components/PollSection'
import { usePresetMode } from '@/features/region/presetMode'
import { rankIn } from '@/features/region/rank'
import type { TierMode } from '@/features/tier/types'
import { useTierQuery } from '@/features/tier/useTierQuery'
import { useCarryLink } from '@/hooks/useCarryLink'
import { useMonthParam } from '@/hooks/useQueryState'
import { NotFoundError } from '@/lib/errors'

const QUIET_MODE: TierMode = { tab: 'metric', metric: 'quiet' }

/** W-04 동네 프로필 (/dongs/:dongId) */
export default function DongProfilePage() {
  const { dongId = '' } = useParams()
  const [month, setMonth] = useMonthParam()
  // W-03 과 같은 훅: preset·metrics(serializeMetrics 포함) → 밸류 탭 모드와 라벨
  const { mode: presetMode, presetLabel } = usePresetMode()

  const dong = useDongQuery(dongId, month)
  const tierDong = useTierQuery(month, 'dong')
  const tierSgg = useTierQuery(month, 'sigungu')
  const notes = useDongNotesQuery(dongId)
  const poll = useDongPollQuery(dongId, month)
  const geo = useGeoQuery(dong.data?.sigungu.id)
  const compareLink = useCarryLink(`/compare?dongs=${dongId}`)

  const gradeOf = useCallback(
    (id: string): Grade | null => {
      const r = tierDong.data ? rankIn(tierDong.data.items, id, QUIET_MODE) : null
      return r ? r.grade : null
    },
    [tierDong.data],
  )

  if (dong.isError && dong.error instanceof NotFoundError) throw dong.error

  if (dong.isPending || (!dong.data && tierDong.isPending)) {
    return (
      <PageContainer className="py-8">
        <DongSkeleton />
      </PageContainer>
    )
  }
  if (dong.isError || !dong.data) {
    return (
      <PageContainer className="py-16 text-center">
        <p className="text-body-base text-text-secondary">{DONG_COPY.loadError}</p>
        <button
          type="button"
          onClick={() => dong.refetch()}
          className="bg-brand-primary text-text-inverse mt-4 rounded-lg px-5 py-3"
        >
          {DONG_COPY.retry}
        </button>
      </PageContainer>
    )
  }

  const detail = dong.data
  const items = tierDong.data?.items ?? []
  const quietRank = rankIn(items, detail.id, QUIET_MODE)
  const scores = quietRank?.item.scores ?? null
  const quiet = quietRank
    ? { score: quietRank.score, grade: quietRank.grade, total: quietRank.total }
    : null
  const vibeGrade = scores ? metricGrade(scores.vibe) : null
  const peerGrade = scores ? metricGrade(scores.peer) : null
  const dominant = dominantActivity(detail.activityMix)
  const summary = buildDongSummary({
    dominant,
    weekdayPeakHour: detail.peaks.weekday.peakHour,
    vibeGrade: vibeGrade ?? 'C',
    kind: detail.kind,
  })
  const excluded = detail.special ? 1 : 0

  const sggRank = tierSgg.data ? rankIn(tierSgg.data.items, detail.sigungu.id, presetMode) : null
  const sgg = sggRank ? { score: sggRank.score, rank: sggRank.rank } : null

  return (
    <PageContainer className="flex flex-col gap-5 pt-5 pb-16">
      <DongHero
        detail={detail}
        month={month}
        summary={summary}
        dominantLabel={ACTIVITY_LABEL[dominant]}
      />
      <div className="mt-2 flex items-start gap-12">
        <div className="divide-border-default flex min-w-0 flex-1 flex-col divide-y">
          <div className="pt-6 pb-8">
            <DongScoreCard
              detail={detail}
              month={month}
              quiet={quiet}
              vibeGrade={vibeGrade}
              peerGrade={peerGrade}
            />
          </div>
          <HourlyCurveSection
            id={detail.id}
            hourly={detail.hourly}
            peaks={detail.peaks}
            month={month}
            onMonthChange={setMonth}
          />
          {/* 동네 성격은 Figma v2 에 아직 없는 섹션(스펙 §3-4). 다른 섹션과 같은 머리·간격 */}
          <DetailSection
            title={DONG_COPY.activityTitle}
            titleId="activity-title"
            caption={DONG_COPY.activityCaption}
          >
            <ActivityMixBar mix={detail.activityMix} />
            <p className="text-body-sm text-text-secondary">{summary}</p>
          </DetailSection>
          <DongMetricGrid
            detail={detail}
            month={month}
            scores={scores}
            total={items.length}
            excluded={excluded}
          />
          <DongMap detail={detail} geo={geo.data} quietGrade={quiet?.grade ?? null} />
          <QuieterTwinsSection
            twins={detail.quieterTwins}
            currentId={detail.id}
            gradeOf={gradeOf}
          />
          <NoteSection
            title={`워케이션 노트 · ${detail.name}`}
            caption={`로그인 사용자 ${notes.data?.total ?? 0}명의 팁 · 도움순`}
            data={notes.data}
            status={notes.status}
            onRetry={() => notes.refetch()}
          />
          <PollSection
            question={pollQuestion(detail.name, vibeGrade ?? 'C')}
            data={poll.data}
            status={poll.status}
            onRetry={() => poll.refetch()}
            participationLabel={DONG_COPY.pollParticipation}
            title="체감 투표"
            sectionCaption="투표 결과는 지표 검증·가중치 조정에 반영"
          />
          <Link to={compareLink} className="group flex items-center justify-between pt-6 pb-2">
            <span className="flex flex-col gap-0.5">
              <span className="text-body-base text-text-primary font-medium group-hover:underline">
                {DONG_COPY.compareLink}
              </span>
              <span className="text-body-sm text-text-secondary">{DONG_COPY.compareLinkSub}</span>
            </span>
            <ChevronRight size={20} aria-hidden className="text-text-primary" />
          </Link>
        </div>
        <DongPlanCard
          detail={detail}
          month={month}
          onMonthChange={setMonth}
          quiet={quiet}
          presetLabel={presetLabel}
          sgg={sgg}
        />
      </div>
    </PageContainer>
  )
}
