import { EXPLORE_COPY } from '@/features/explore/copy'

/** W-09 지도 탐색 (/explore). v6 지도·패널 조립은 페이지 Task 에서 한다 */
export default function ExplorePage() {
  return (
    <div className="min-w-desktop h-explore flex flex-col">
      <h1 className="sr-only">{EXPLORE_COPY.pageTitle}</h1>
    </div>
  )
}
