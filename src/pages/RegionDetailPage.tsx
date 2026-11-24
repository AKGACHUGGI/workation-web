import { useEffect, useRef } from 'react'
import { useLocation, useParams } from 'react-router-dom'
import PageContainer from '@/components/layout/PageContainer'
import { recordInterest, useBoost } from '@/features/interest'
import { useFavorites } from '@/features/me/useFavorites'
import { METRIC_LABEL, METRIC_SHORT_LABEL } from '@/features/metric/constants'
import { METRIC_KEYS } from '@/features/metric/types'
import { DATA_YEAR, DEFAULT_MONTH, monthLabel, monthNumber } from '@/features/metric/month'
import type { MonthParam } from '@/features/metric/month'
import { metricGrade } from '@/features/metric/score'
import DongList from '@/features/region/components/DongList'
import LinkList from '@/features/region/components/LinkList'
import MetricGrid from '@/features/region/components/MetricGrid'
import MonthlyCrowdChart from '@/features/region/components/MonthlyCrowdChart'
import NoteSection from '@/features/region/components/NoteSection'
import PhotoGallery from '@/features/region/components/PhotoGallery'
import PlanCard from '@/features/region/components/PlanCard'
import PollSection from '@/features/region/components/PollSection'
import ReasonSection from '@/features/region/components/ReasonSection'
import RegionAskSection from '@/features/region/components/RegionAskSection'
import RegionHero from '@/features/region/components/RegionHero'
import RegionSkeleton from '@/features/region/components/RegionSkeleton'
import ScoreCard from '@/features/region/components/ScoreCard'
import WeekendCompare from '@/features/region/components/WeekendCompare'
import { overnightCopy, rankCopy, SEASON_LABEL } from '@/features/region/copy'
import { formatMonths } from '@/features/region/format'
import { usePresetMode } from '@/features/region/presetMode'
import { rankIn } from '@/features/region/rank'
import { buildReason } from '@/features/region/reason'
import { useRegionNotesQuery } from '@/features/region/useRegionNotesQuery'
import { useRegionPollQuery } from '@/features/region/useRegionPollQuery'
import { useRegionQuery } from '@/features/region/useRegionQuery'
import { useShareUrl } from '@/features/region/useShareUrl'
import { useTierQuery } from '@/features/tier/useTierQuery'
import { carryQuery } from '@/hooks/carryQuery'
import { useMonthParam, usePresetParam } from '@/hooks/useQueryState'
import { NotFoundError } from '@/lib/errors'

const status = (q: { isPending: boolean; isError: boolean }) =>
  q.isPending ? 'pending' : q.isError ? 'error' : 'success'

/** W-03 지역 상세 */
export default function RegionDetailPage() {
  const { sggId = '' } = useParams()
  const { search } = useLocation()
  const [month, setMonth] = useMonthParam()
  const [preset, setPreset] = usePresetParam()
  const { mode, presetLabel, selected } = usePresetMode()
  const { isFavorite, toggle } = useFavorites()
  const saved = isFavorite('regions', sggId)
  const share = useShareUrl()
  // 들어온 순간의 기록으로 고정해 자기 조회 기록 때문에 보는 도중 순위가 바뀌지 않게 한다
  const boost = useBoost({ live: false, freezeKey: sggId })

  const tier = useTierQuery(month, 'sigungu')
  const region = useRegionQuery(sggId, month)
  const notes = useRegionNotesQuery(sggId)
  const pollMonth = month === 'annual' ? DEFAULT_MONTH : month
  const poll = useRegionPollQuery(sggId, pollMonth, preset)

  // 지역마다 한 번, 그 순간 화면이 가진 점수·지형을 스냅숏으로 관심 기록한다 (설계 8절)
  const recordedSgg = useRef<string | null>(null)
  useEffect(() => {
    // 이전 달 응답을 잠시 보여 주는 동안에는 달과 점수가 어긋나므로 기다린다
    if (recordedSgg.current === sggId || tier.isPlaceholderData) return
    const it = tier.data?.items.find((i) => i.id === sggId)
    if (!it) return
    recordedSgg.current = sggId
    recordInterest({
      kind: 'region_view',
      target: sggId,
      payload: { sigunguId: null, snapshot: { month, scores: it.scores, terrain: it.terrain } },
    })
  }, [sggId, month, tier.data, tier.isPlaceholderData])

  // 404 는 라우트 errorElement(NotFoundPage)가 그린다 — pages 끼리 import 하지 않는다
  if (region.isError && region.error instanceof NotFoundError) throw region.error
  if (region.isPending || tier.isPending) {
    return (
      <PageContainer className="py-10">
        <RegionSkeleton />
      </PageContainer>
    )
  }
  if (region.isError || tier.isError || !region.data || !tier.data) {
    return (
      <PageContainer className="py-10">
        <p className="text-body-base text-text-secondary">
          지역 정보를 불러오지 못했습니다{' '}
          <button
            type="button"
            onClick={() => (region.isError ? region.refetch() : tier.refetch())}
            className="underline"
          >
            다시 시도
          </button>
        </p>
      </PageContainer>
    )
  }

  const d = region.data
  const rank = rankIn(tier.data.items, sggId, mode, boost)
  if (!rank) throw new NotFoundError(`region ${sggId}`)
  const scores = rank.item.scores
  const score = Math.round(rank.score)
  const total = tier.data.items.length
  const mLabel = monthLabel(month)
  const crowdGrade = metricGrade(scores.crowd)
  const current = new URLSearchParams(search)
  const hrefFor = (dongId: string) => carryQuery(`/dongs/${dongId}`, current)
  const dim = (k: (typeof METRIC_KEYS)[number]) =>
    selected && !selected.includes(k) ? 'opacity-dim' : ''

  const sentences = buildReason({
    monthLabel: mLabel,
    presetLabel,
    composite: score,
    rank: rank.rank,
    total,
    grade: rank.grade,
    overnightCoef: d.stats.overnightCoef,
    dayInflow: d.stats.dayInflow,
    crowdIndex: d.stats.crowdIndex,
    crowdGrade,
    bestMonths: d.bestMonths,
    peerOffpeakMonths: d.peerOffpeakMonths,
  })

  const pollQuestion =
    preset === 'quiet'
      ? `${mLabel} ${d.name}, 실제로 조용했나요?`
      : preset === 'lively'
        ? `${mLabel} ${d.name}, 실제로 활기 있었나요?`
        : `${mLabel} ${d.name}, 어땠나요?`
  const supportLink = d.links.find((l) => l.kind === 'support')

  return (
    <PageContainer className="flex flex-col gap-5 pt-5 pb-16">
      <RegionHero
        breadcrumb={[
          { label: '탐색', href: carryQuery('/', current) },
          { label: d.province },
          { label: d.name },
        ]}
        title={`${d.name}, ${d.province}`}
        metaLine={`${d.tags.join(' · ')} · ${mLabel}`}
        tags={[
          ...d.tags.map((t) => ({ label: t })),
          { label: SEASON_LABEL[d.seasonType] },
          { label: `${presetLabel} ${rank.rank}위 · ${rank.grade}`, tone: 'selected' as const },
        ]}
        onShare={share}
        onSave={() => toggle('regions', sggId)}
        saved={saved}
        saveLabel={saved ? '저장됨' : '저장'}
      />
      <PhotoGallery photos={d.photos} alt={d.name} />

      <div className="mt-2 flex items-start gap-12">
        <div className="divide-border-default border-border-default flex min-w-0 flex-1 flex-col divide-y border-b">
          <div className="pt-6 pb-8">
            <ScoreCard
              score={score}
              headline={`${presetLabel} 프리셋 · ${total}곳 중 ${rank.rank}위 · ${rank.grade}`}
              detail={
                <>
                  <span>{mLabel} 기준</span>
                  {METRIC_KEYS.map((k) => (
                    <span key={k} className={dim(k)}>
                      · {METRIC_SHORT_LABEL[k]} {metricGrade(scores[k])}
                    </span>
                  ))}
                </>
              }
              summary={[
                {
                  label: METRIC_LABEL.crowd,
                  value: crowdGrade,
                  caption: `${mLabel} 혼잡 ${d.stats.crowdIndex}`,
                },
                {
                  label: `낮 유입 지수 ${d.stats.dayInflow.toFixed(2)}`,
                  value: `${d.stats.quietRank}위`,
                },
                { label: '숙박 계수', value: d.stats.overnightCoef.toFixed(2) },
                { label: '주말 ÷ 주중 낮', value: `${d.stats.weekendRatio.toFixed(2)}배` },
              ]}
            />
          </div>
          <MetricGrid
            caption={`${mLabel} · 시군구 ${total}곳 백분위`}
            cards={[
              {
                metric: 'crowd',
                score: scores.crowd,
                subtitle: `${mLabel} 혼잡 ${d.stats.crowdIndex} · 연중 최대 대비 ${d.stats.crowdIndex}%`,
              },
              {
                metric: 'quiet',
                score: scores.quiet,
                subtitle: `낮 유입 지수 ${d.stats.dayInflow.toFixed(2)} · ${total}곳 중 ${d.stats.quietRank}위`,
              },
              {
                metric: 'peer',
                score: scores.peer,
                subtitle: `20~40대 방문 비율 ${d.stats.peerShare}%`,
              },
              {
                metric: 'overnight',
                score: scores.overnight,
                subtitle: `숙박 계수 ${d.stats.overnightCoef.toFixed(2)} · ${overnightCopy(d.stats.overnightCoef)}`,
              },
              {
                metric: 'vibe',
                score: scores.vibe,
                subtitle: `저녁 유동 ÷ 저녁 체류 · ${rankCopy(scores.vibe)}`,
              },
            ]}
          />
          <MonthlyCrowdChart
            months={d.months}
            bestMonths={d.bestMonths}
            avoidMonths={d.avoidMonths}
            peerOffpeakMonths={d.peerOffpeakMonths}
            selectedMonth={monthNumber(month)}
            onSelectMonth={(m) =>
              setMonth(`${DATA_YEAR}-${String(m).padStart(2, '0')}` as MonthParam)
            }
          />
          <WeekendCompare ratio={d.stats.weekendRatio} />
          <ReasonSection sentences={sentences} />
          <DongList
            dongs={d.dongs}
            excludedDongs={d.excludedDongs}
            month={month}
            hrefFor={hrefFor}
          />
          <NoteSection
            title={`워케이션 노트 · ${d.name}`}
            caption={`로그인 사용자 ${notes.data?.total ?? 0}명의 팁 · 도움순`}
            data={notes.data}
            status={status(notes)}
            onRetry={() => notes.refetch()}
          />
          <PollSection
            question={pollQuestion}
            caption={month === 'annual' ? '연간 보기에서는 최신 달(12월) 기준' : undefined}
            data={poll.data}
            status={status(poll)}
            onRetry={() => poll.refetch()}
            participationLabel="지표 검증에 반영돼요"
            photoCaption={`${monthLabel(pollMonth)} · 사용자 제공`}
            target={{ kind: 'regions', id: sggId, month: pollMonth, preset }}
          />
          <LinkList links={d.links} area={`${d.province} ${d.name}`} />
        </div>
        {/* 계획 카드는 제자리에 두고, 채팅은 그 아래에서 스크롤하면 화면 위쪽에 붙는다 (열이 본문 높이만큼 늘어야 붙어 있는다) */}
        <div className="w-sidebar mt-6 flex shrink-0 flex-col gap-4 self-stretch">
          <PlanCard
            score={score}
            headline={`${total}곳 중 ${rank.rank}위 · ${rank.grade}`}
            month={month}
            onMonthChange={setMonth}
            preset={preset}
            onPresetChange={setPreset}
            customLinkHref={carryQuery('/tier', current)}
            onFavorite={() => toggle('regions', sggId)}
            favorite={saved}
            onShare={share}
            summary={[
              { label: '가기 좋은 달', value: formatMonths(d.bestMonths) },
              { label: '피할 달', value: formatMonths(d.avoidMonths) },
              { label: '주말 ÷ 주중 낮 체류', value: `${d.stats.weekendRatio.toFixed(2)}배` },
              { label: '지원사업', value: supportLink?.title ?? '등록 전' },
            ]}
          />
          <RegionAskSection
            key={sggId}
            sigunguId={sggId}
            name={d.name}
            month={month}
            dongHref={hrefFor}
          />
        </div>
      </div>
    </PageContainer>
  )
}
