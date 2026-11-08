import { useMemo } from 'react'
import { useLocation } from 'react-router-dom'
import ListingCard from '@/components/ui/ListingCard'
import { useFavorites } from '@/features/me/useFavorites'
import { METRIC_SHORT_LABEL } from '@/features/metric/constants'
import { monthLabel } from '@/features/metric/month'
import type { MonthParam } from '@/features/metric/month'
import { composite, metricGrade, toGrades } from '@/features/metric/score'
import type { MetricKey } from '@/features/metric/types'
import PopularEmpty from '@/features/popular/components/PopularEmpty'
import PopularHeader from '@/features/popular/components/PopularHeader'
import { POPULAR_NOTE } from '@/features/popular/copy'
import { formatCount } from '@/features/popular/format'
import { DEFAULT_SORT, parseSort } from '@/features/popular/params'
import { rankBadge, sortPopular, terrainMatch } from '@/features/popular/sort'
import type { PopularRegion, PopularSort } from '@/features/popular/types'
import { useTerrainParam } from '@/features/popular/useTerrainParam'
import { useWeights } from '@/features/popular/useWeights'
import { carryQuery } from '@/hooks/carryQuery'
import { useQueryState } from '@/hooks/useQueryState'

const CHIP_METRICS: MetricKey[] = ['quiet', 'peer', 'overnight']

type Props = {
  items: PopularRegion[]
  month: MonthParam
  hoverId: string | null
  onHover: (id: string | null) => void
}

/** 인기 지역 카드 3열. 정렬·필터·점수·등급은 여기서 계산 */
export default function PopularRegions({ items, month, hoverId, onHover }: Props) {
  const [sort, setSort] = useQueryState<PopularSort>('sort', parseSort, DEFAULT_SORT)
  const [terrain, setTerrain] = useTerrainParam()
  const { preset, setPreset, selected, setSelected, weights } = useWeights()
  const { isFavorite, toggle } = useFavorites()
  const { search } = useLocation()
  const current = useMemo(() => new URLSearchParams(search), [search])

  const list = useMemo(() => {
    const sorted = sortPopular(items, sort, weights)
    const grades = toGrades(sorted.map((i) => composite(i.scores, weights)))
    const withGrade = sorted.map((item, i) => ({ item, grade: grades[i] }))
    return withGrade.filter(({ item }) => terrainMatch(item, terrain))
  }, [items, sort, weights, terrain])

  return (
    <section className="flex flex-col gap-6">
      <PopularHeader
        count={items.length}
        sort={sort}
        onSortChange={setSort}
        preset={preset}
        onPresetChange={setPreset}
        selected={selected}
        onSelectedChange={setSelected}
      />
      {list.length === 0 ? (
        <PopularEmpty onClearFilter={() => setTerrain([])} />
      ) : (
        <div data-testid="popular-grid" className="grid grid-cols-3 gap-6">
          {list.map(({ item, grade }, index) => (
            <ListingCard
              key={item.id}
              photoUrl={item.photoUrl}
              title={`${item.name}, ${item.province}`}
              score={composite(item.scores, weights)}
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
