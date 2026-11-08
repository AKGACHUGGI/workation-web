import { useState } from 'react'
import HeatmapRail from '@/features/heatmap/components/HeatmapRail'
import { useMonthParam } from '@/hooks/useQueryState'
import CategoryStrip from '@/features/popular/components/CategoryStrip'
import HomeMonthBar from '@/features/popular/components/HomeMonthBar'
import PopularRegions from '@/features/popular/components/PopularRegions'
import PopularSkeleton from '@/features/popular/components/PopularSkeleton'
import { POPULAR_ERROR } from '@/features/popular/copy'
import { usePopularQuery } from '@/features/popular/usePopularQuery'
import IntentTags from '@/features/search/components/IntentTags'
import SearchSection from '@/features/search/components/SearchSection'
import { SEARCH_INPUT_ID } from '@/features/search/searchInput'
import { useSearchIntent } from '@/features/search/useSearchIntent'

/**
 * W-01 탐색(홈): 검색 · 카테고리 · 인기 지역 카드 · 지도 히트맵.
 * Figma 274:4703: 결과 영역 좌우 24 → 카드 열 948(300 × 3 + 24 × 2) · 간격 24 · 히트맵 420
 */
export default function HomePage() {
  const [month] = useMonthParam()
  const popular = usePopularQuery(month)
  const search = useSearchIntent()
  const [hoverId, setHoverId] = useState<string | null>(null)

  const editConditions = () => {
    const input = document.getElementById(SEARCH_INPUT_ID)
    input?.scrollIntoView?.({ block: 'center' })
    input?.focus()
  }

  return (
    <div className="max-w-page min-w-desktop mx-auto flex w-full flex-col px-6">
      <SearchSection
        q={search.q}
        pending={search.pending}
        noResult={search.noResult}
        onSubmit={search.submit}
      />
      <CategoryStrip />
      <HomeMonthBar />
      <hr className="border-border-default mx-2 mt-5" />
      <div className="flex gap-6 pt-8 pb-10">
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
              conditions={
                search.intent && (
                  <IntentTags
                    tags={search.intent.tags}
                    onRemove={search.removeTag}
                    onClear={search.clear}
                    onEdit={editConditions}
                  />
                )
              }
            />
          )}
        </div>
        <HeatmapRail hoverId={hoverId} onHover={setHoverId} />
      </div>
    </div>
  )
}
