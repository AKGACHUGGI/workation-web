import type {
  ExploreDong,
  ExploreGraphResponse,
  ExplorePlace,
  ExploreProvince,
  ExploreSigungu,
  ExploreTag,
} from '@/features/explore/types'

export type GraphIndex = {
  res: ExploreGraphResponse
  tagById: Map<string, ExploreTag>
  provinceById: Map<string, ExploreProvince>
  sigunguById: Map<string, ExploreSigungu>
  dongById: Map<string, ExploreDong>
  placeById: Map<string, ExplorePlace>
  /** tagId → 그 태그가 있는 동 (집계 제외 동 빼고, 응답 순서) */
  dongsByTag: Map<string, ExploreDong[]>
  /** `${dongId}:${tagId}` → 장소 (응답 순서 = id 순) */
  placesByDongTag: Map<string, ExplorePlace[]>
}

const key = (dongId: string, tagId: string) => `${dongId}:${tagId}`

/** 응답을 받은 직후 1회. 이후 계산은 모두 이 맵으로 한다 */
export function indexGraph(res: ExploreGraphResponse): GraphIndex {
  const dongsByTag = new Map<string, ExploreDong[]>(res.tags.map((t) => [t.id, []]))
  for (const d of res.dongs) {
    if (d.excluded) continue
    for (const t of d.tags) dongsByTag.get(t.tagId)?.push(d)
  }
  const placesByDongTag = new Map<string, ExplorePlace[]>()
  for (const p of res.places) {
    const k = key(p.dongId, p.tag)
    const list = placesByDongTag.get(k)
    if (list) list.push(p)
    else placesByDongTag.set(k, [p])
  }
  return {
    res,
    tagById: new Map(res.tags.map((t) => [t.id, t])),
    provinceById: new Map(res.provinces.map((p) => [p.id, p])),
    sigunguById: new Map(res.sigungu.map((s) => [s.id, s])),
    dongById: new Map(res.dongs.map((d) => [d.id, d])),
    placeById: new Map(res.places.map((p) => [p.id, p])),
    dongsByTag,
    placesByDongTag,
  }
}

export function placesOf(index: GraphIndex, dongId: string, tagId: string): ExplorePlace[] {
  return index.placesByDongTag.get(key(dongId, tagId)) ?? []
}

export function hasTag(dong: ExploreDong, tagId: string): boolean {
  return dong.tags.some((t) => t.tagId === tagId)
}

/** branch 태그 장소 수. badge·없는 태그는 0 */
export function tagCount(dong: ExploreDong, tagId: string): number {
  return dong.tags.find((t) => t.tagId === tagId)?.placeCount ?? 0
}

export function provinceOf(index: GraphIndex, dong: ExploreDong): ExploreProvince | undefined {
  const sgg = index.sigunguById.get(dong.sigunguId)
  return sgg ? index.provinceById.get(sgg.provinceId) : undefined
}
