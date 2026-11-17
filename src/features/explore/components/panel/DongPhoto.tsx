import PhotoThumb from '@/components/ui/PhotoThumb'
import Block from '@/features/explore/components/Skeleton'
import { DONG_SECTION_H } from '@/features/explore/components/panel/panelLayout'
import type { DongDetail } from '@/features/explore/types'
import { usePopularQuery } from '@/features/popular/usePopularQuery'
import { useMonthParam } from '@/hooks/useQueryState'

/**
 * ② 대표 사진. 홈(W-01) 인기 지역 카드와 같은 시군구 사진을 쓴다 (인기 지역 id = 시군구 id).
 * 홈과 같은 쿼리라 홈을 거쳐 왔으면 캐시에서 바로 나온다. 사진이 없는 시군구면 칸을 두지 않는다
 */
export default function DongPhoto({ dong }: { dong: DongDetail }) {
  const [month] = useMonthParam()
  const popular = usePopularQuery(month)
  if (popular.isPending) {
    return (
      <div data-section="photo" className={`shrink-0 ${DONG_SECTION_H.photo}`}>
        <Block shape="slot" className="size-full" />
      </div>
    )
  }
  const photoUrl = popular.data?.items.find((r) => r.id === dong.sigungu.id)?.photoUrl
  if (!photoUrl) return null
  return (
    <div data-section="photo" className="shrink-0">
      <PhotoThumb
        photoUrl={photoUrl}
        alt={`${dong.sigungu.name} 대표 사진`}
        className={DONG_SECTION_H.photo}
      />
    </div>
  )
}
