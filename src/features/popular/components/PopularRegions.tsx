import { useMemo } from 'react'
import type { ReactNode } from 'react'
import { useLocation } from 'react-router-dom'
import ListingCard from '@/components/ui/ListingCard'
import { useBoost } from '@/features/interest'
import { useFavorites } from '@/features/me/useFavorites'
import { METRIC_SHORT_LABEL } from '@/features/metric/constants'
import { monthLabel } from '@/features/metric/month'
import type { MonthParam } from '@/features/metric/month'
import { metricGrade } from '@/features/metric/score'
import type { MetricKey } from '@/features/metric/types'
import PopularEmpty from '@/features/popular/components/PopularEmpty'
import PopularHeader from '@/features/popular/components/PopularHeader'
import { POPULAR_NOTE } from '@/features/popular/copy'
import { formatCount } from '@/features/popular/format'
import { DEFAULT_SORT, parseSort } from '@/features/popular/params'
import { personalPopular, rankBadge, sortPopular, tagMatch } from '@/features/popular/sort'
import type { PopularRegion, PopularSort } from '@/features/popular/types'
import { usePlaceParam, useTerrainParam } from '@/features/popular/useTerrainParam'
import { useWeights } from '@/features/popular/useWeights'
import { carryQuery } from '@/hooks/carryQuery'
import { useQueryState } from '@/hooks/useQueryState'
import { useRankMotion } from '@/hooks/useRankMotion'

const CHIP_METRICS: MetricKey[] = ['quiet', 'peer', 'overnight']

type Props = {
  items: PopularRegion[]
  month: MonthParam
  hoverId: string | null
  onHover: (id: string | null) => void
  /** PopularHeader 제목 아래 "AI가 이해한 조건" 줄 */
  conditions?: ReactNode
}

/** 인기 지역 카드 3열. 정렬·필터·점수·등급은 여기서 계산 */
export default function PopularRegions({ items, month, hoverId, onHover, conditions }: Props) {
  const [sort, setSort] = useQueryState<PopularSort>('sort', parseSort, DEFAULT_SORT)
  const [terrain, setTerrain] = useTerrainParam()
  const [place, setPlace] = usePlaceParam()
  const { weights } = useWeights()
  const { isFavorite, toggle } = useFavorites()
  const boost = useBoost()
  const { search } = useLocation()
  const current = useMemo(() => new URLSearchParams(search), [search])

  // 카드 점수·등급과 정렬이 같은 개인 점수(관심 가산점 포함)를 쓰게 목록 전체로 한 번 계산
  const list = useMemo(() => {
    const personal = personalPopular(items, weights, boost)
    return sortPopular(items, sort, weights, boost)
      .map((item) => ({ item, ...personal.get(item.id)! }))
      .filter(({ item }) => tagMatch(item, terrain, place))
  }, [items, sort, weights, terrain, place, boost])
  // 응답이 바뀌면(달) 페이드, 정렬·무드·필터로 순서만 바뀌면 카드가 새 순위 자리로 이동
  const motionRef = useRankMotion<HTMLDivElement>(items)

  return (
    <section className="flex flex-col gap-6">
      <PopularHeader
        count={list.length}
        sort={sort}
        onSortChange={setSort}
        conditions={conditions}
      />
      {list.length === 0 ? (
        <PopularEmpty
          onClearFilter={() => {
            setTerrain([])
            setPlace([])
          }}
        />
      ) : (
        <div ref={motionRef} data-testid="popular-grid" className="grid grid-cols-3 gap-6">
          {list.map(({ item, score, grade }, index) => (
            <ListingCard
              key={item.id}
              rankId={item.id}
              photoUrl={item.photoUrl}
              title={`${item.name}, ${item.province}`}
              score={score}
              scoreGrade={grade}
              badge={rankBadge(sort, index)}
              meta1={item.tags.join(' · ')}
              meta2={`즐겨찾기 ${item.favoriteCount.toLocaleString('ko-KR')} · 조회 ${formatCount(item.viewCount)} · ${monthLabel(month)}`}
              chips={CHIP_METRICS.map((m) => ({
                label: METRIC_SHORT_LABEL[m],
                grade: metricGrade(item.scores[m]),
              }))}
              favorite={isFavorite('regions', item.id)}
              onToggleFavorite={() => toggle('regions', item.id)}
              href={carryQuery(`/regions/${item.id}`, current)}
              highlighted={hoverId === item.id}
              onMouseEnter={() => onHover(item.id)}
              onMouseLeave={() => onHover(null)}
            />
          ))}
        </div>
      )}
      <p className="text-caption-xs text-text-tertiary">{POPULAR_NOTE}</p>
    </section>
  )
}
