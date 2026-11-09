import { EXPLORE_COPY, PROVINCE_SHORT, TAG_SHORT } from '@/features/explore/copy'
import { hasTag, provinceOf, tagCount } from '@/features/explore/indexGraph'
import type { GraphIndex } from '@/features/explore/indexGraph'
import type { Bounds, ExploreDong, MatchMode } from '@/features/explore/types'
import { inBounds, unionBounds } from '@/features/explore/view'

export type DongMatch = {
  dongId: string
  /** 고른 태그 중 이 동이 가진 것 (응답 tags 순서) */
  matched: string[]
  /** 고른 태그를 모두 가짐 → 검정 표시 */
  all: boolean
  /** 가진 branch 태그 장소 수 합 (정렬용) */
  placeTotal: number
}

export type ProvinceGroup = {
  provinceId: string
  name: string
  short: string
  count: number
  /** 그 도의 해당 동이 모두 보이는 범위 */
  bounds: Bounds
}

/** 고른 태그가 있는 동 (집계 제외 빼고). 장소 많은 순 → 이름 순 */
export function matchDongs(index: GraphIndex, tagIds: string[], mode: MatchMode): DongMatch[] {
  if (tagIds.length === 0) return []
  const ordered = index.res.tags.map((t) => t.id).filter((id) => tagIds.includes(id))
  const result: DongMatch[] = []
  for (const d of index.res.dongs) {
    if (d.excluded) continue
    const matched = ordered.filter((id) => hasTag(d, id))
    if (matched.length === 0) continue
    const all = matched.length === ordered.length
    if (mode === 'all' && !all) continue
    const placeTotal = matched.reduce((s, id) => s + tagCount(d, id), 0)
    result.push({ dongId: d.id, matched, all, placeTotal })
  }
  const nameOf = (id: string) => index.dongById.get(id)!.name
  return result.sort(
    (a, b) => b.placeTotal - a.placeTotal || nameOf(a.dongId).localeCompare(nameOf(b.dongId), 'ko'),
  )
}

/** 동 중심이 화면 안이면 inView. 중심이 없는 동은 어느 쪽에도 넣지 않는다 */
export function splitByView(
  index: GraphIndex,
  matches: DongMatch[],
  bounds: Bounds,
): { inView: DongMatch[]; offscreen: DongMatch[] } {
  const inView: DongMatch[] = []
  const offscreen: DongMatch[] = []
  for (const m of matches) {
    const c = index.dongById.get(m.dongId)?.center
    if (!c) continue
    ;(inBounds(c, bounds) ? inView : offscreen).push(m)
  }
  return { inView, offscreen }
}

/** 도별 개수 (많은 순 → 도 id 순). 줌 ~8 배지와 화면 밖 칩이 쓴다 */
export function groupByProvince(index: GraphIndex, matches: DongMatch[]): ProvinceGroup[] {
  const groups = new Map<string, { dongs: ExploreDong[] }>()
  for (const m of matches) {
    const d = index.dongById.get(m.dongId)
    const p = d ? provinceOf(index, d) : undefined
    if (!d || !p) continue
    const g = groups.get(p.id)
    if (g) g.dongs.push(d)
    else groups.set(p.id, { dongs: [d] })
  }
  return [...groups.entries()]
    .map(([provinceId, g]) => ({
      provinceId,
      name: index.provinceById.get(provinceId)!.name,
      short: PROVINCE_SHORT[provinceId] ?? index.provinceById.get(provinceId)!.name,
      count: g.dongs.length,
      bounds: unionBounds(g.dongs.map((d) => d.bbox)),
    }))
    .sort((a, b) => b.count - a.count || a.provinceId.localeCompare(b.provinceId))
}

/** 화면 밖 해당 동의 도별 개수 (왼쪽 아래 칩) */
export function countOffscreen(
  index: GraphIndex,
  matches: DongMatch[],
  bounds: Bounds,
): ProvinceGroup[] {
  return groupByProvince(index, splitByView(index, matches, bounds).offscreen)
}

/** 동 표시 hover: `{동} · {태그} {n} · …` / `누르면 {동} 중심 그래프로 확대` */
export function markerTooltip(
  index: GraphIndex,
  dong: ExploreDong,
  matched: string[],
): { title: string; hint: string } {
  const parts = matched.map((id) => {
    const short = TAG_SHORT[id] ?? id
    return index.tagById.get(id)?.display === 'badge' ? short : `${short} ${tagCount(dong, id)}`
  })
  return { title: [dong.name, ...parts].join(' · '), hint: EXPLORE_COPY.markerHint(dong.name) }
}
