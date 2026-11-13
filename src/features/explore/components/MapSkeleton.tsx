import { EXPLORE_COPY } from '@/features/explore/copy'

/** 지도 SDK 로딩 중 (Figma L1 429:9359): 땅 색 바탕 + 반짝임, 확대 버튼·범례 자리에 회색 상자 */
export default function MapSkeleton() {
  return (
    <div aria-busy="true" className="bg-explore-map-land-alt skeleton-shine relative h-full w-full">
      <span className="sr-only">{EXPLORE_COPY.loading}</span>
      <div className="bg-explore-skeleton-map absolute right-4 bottom-14.75 h-20.25 w-10 rounded-lg" />
      <div className="bg-explore-skeleton-map absolute bottom-9 left-4 h-16 w-117.25 rounded-xl" />
    </div>
  )
}
