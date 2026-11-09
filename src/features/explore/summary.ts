import { tagCount } from '@/features/explore/indexGraph'
import type { GraphIndex } from '@/features/explore/indexGraph'
import type { Bounds, ExploreDong, ExploreTag } from '@/features/explore/types'
import { inBounds } from '@/features/explore/view'

export type TagSummary = { tag: ExploreTag; count: number }

/** ⓪ 패널·① "태그 더 고르기": 범위 안(동 중심 기준) 태그별 동 수, 태그 순서 */
export function summarizeTags(index: GraphIndex, bounds: Bounds): TagSummary[] {
  return index.res.tags.map((tag) => ({
    tag,
    count: (index.dongsByTag.get(tag.id) ?? []).filter(
      (d) => d.center && inBounds(d.center, bounds),
    ).length,
  }))
}

function cafeAndStay(dongs: ExploreDong[]) {
  let cafe = 0
  let stay = 0
  for (const d of dongs) {
    cafe += tagCount(d, 'cafe')
    stay += tagCount(d, 'long_stay') + tagCount(d, 'resort')
  }
  return `카페 ${cafe} · 숙소 ${stay}`
}

/** 태그 선택 전 행정동 라벨: `{이름} · 카페 n · 숙소 n` */
export function dongAreaLabel(dong: ExploreDong): string {
  return `${dong.name} · ${cafeAndStay([dong])}`
}

/** 태그 선택 전 시군구 라벨: `{이름} · 동 n · 카페 n · 숙소 n` */
export function sigunguAreaLabel(index: GraphIndex, sigunguId: string): string {
  const dongs = index.res.dongs.filter((d) => d.sigunguId === sigunguId && !d.excluded)
  const name = index.sigunguById.get(sigunguId)?.name ?? sigunguId
  return `${name} · 동 ${dongs.length} · ${cafeAndStay(dongs)}`
}
