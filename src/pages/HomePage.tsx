import { useState } from 'react'
import PageContainer from '@/components/layout/PageContainer'
import HeatmapRail from '@/features/heatmap/components/HeatmapRail'
import { useMonthParam } from '@/hooks/useQueryState'
import CategoryStrip from '@/features/popular/components/CategoryStrip'
import PopularRegions from '@/features/popular/components/PopularRegions'
import PopularSkeleton from '@/features/popular/components/PopularSkeleton'
import { POPULAR_ERROR } from '@/features/popular/copy'
import { usePopularQuery } from '@/features/popular/usePopularQuery'
import SearchSection from '@/features/search/components/SearchSection'

/** W-01 탐색(홈): 검색 · 카테고리 · 인기 지역 카드 · 지도 히트맵 */
export default function HomePage() {
  const [month] = useMonthParam()
  const popular = usePopularQuery(month)
  const [hoverId, setHoverId] = useState<string | null>(null)

  return (
    <PageContainer className="flex flex-col gap-8 py-10">
      <SearchSection />
      <CategoryStrip />
      <div className="flex gap-8">
        <div className="min-w-0 flex-1">
          {popular.isPending ? (
            <PopularSkeleton />
          ) : popular.isError ? (
            <div className="text-body-base text-text-secondary flex items-center gap-3 py-16">
              {POPULAR_ERROR}
              <button
                type="button"
                onClick={() => popular.refetch()}
                className="text-text-primary underline"
              >
                다시 시도
              </button>
            </div>
          ) : (
            <PopularRegions
              items={popular.data.items}
              month={month}
              hoverId={hoverId}
              onHover={setHoverId}
            />
          )}
        </div>
        <HeatmapRail hoverId={hoverId} onHover={setHoverId} />
      </div>
    </PageContainer>
  )
}
