import { useEffect } from 'react'
import { useLocation, useParams } from 'react-router-dom'
import PageContainer from '@/components/layout/PageContainer'
import GradeBadge from '@/components/ui/GradeBadge'
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
import RegionHero from '@/features/region/components/RegionHero'
import RegionSkeleton from '@/features/region/components/RegionSkeleton'
import ScoreCard from '@/features/region/components/ScoreCard'
import WeekendCompare from '@/features/region/components/WeekendCompare'
import { overnightCopy, rankCopy, SEASON_LABEL } from '@/features/region/copy'
import { formatMonths } from '@/features/region/format'
import { usePresetMode } from '@/features/region/presetMode'
import { rankIn } from '@/features/region/rank'
import { buildReason } from '@/features/region/reason'
import { recordRegionView } from '@/features/region/recordView'
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

  const tier = useTierQuery(month, 'sigungu')
  const region = useRegionQuery(sggId, month)
  const notes = useRegionNotesQuery(sggId)
  const poll = useRegionPollQuery(sggId, month === 'annual' ? DEFAULT_MONTH : month, preset)

  useEffect(() => {
    recordRegionView(sggId)
  }, [sggId])

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
  const rank = rankIn(tier.data.items, sggId, mode)
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
    <PageContainer className="flex flex-col gap-8 py-10">
      <RegionHero
        breadcrumb={[
          { label: '탐색', href: carryQuery('/', current) },
          { label: d.province },
          { label: d.name },
        ]}
        title={`${d.name}, ${d.province}`}
        metaLine={`${d.tags.join(' · ')} · ${mLabel} · 2025 LG U+ 유동·서비스인구`}
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

      <div className="flex items-start gap-8">
        <div className="flex min-w-0 flex-1 flex-col gap-10">
          <ScoreCard
            score={score}
            headline={`${presetLabel} 프리셋 · ${total}곳 중 ${rank.rank}위 · ${rank.grade}`}
            detail={
              <>
                <span>{mLabel} 기준</span>
                {METRIC_KEYS.map((k) => (
                  <span key={k} className={`flex items-center gap-1 ${dim(k)}`}>
                    · {METRIC_SHORT_LABEL[k]}{' '}
                    <GradeBadge grade={metricGrade(scores[k])} size="sm" />
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
                label: '낮 유입 지수',
                value: d.stats.dayInflow.toFixed(2),
                caption: `${total}곳 중 ${d.stats.quietRank}위`,
              },
              { label: '숙박 계수', value: d.stats.overnightCoef.toFixed(2) },
              { label: '주말 ÷ 주중 낮', value: `${d.stats.weekendRatio.toFixed(2)}배` },
            ]}
          />
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
          />
          <LinkList links={d.links} />
        </div>
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
            { label: '지원사업', value: supportLink?.title ?? '—' },
          ]}
        />
      </div>
    </PageContainer>
  )
}
