import { composite } from '@/features/metric/score'
import type { Weights } from '@/features/metric/types'
import { SORT_BADGE_PREFIX } from '@/features/popular/copy'
import type { PopularRegion, PopularSort, Terrain } from '@/features/popular/types'

/** 정렬 기준별 비교. 새 배열을 돌려준다. */
export function sortPopular(
  items: PopularRegion[],
  sort: PopularSort,
  weights: Weights,
): PopularRegion[] {
  const score = new Map(items.map((i) => [i.id, composite(i.scores, weights)]))
  const byScore = (a: PopularRegion, b: PopularRegion) =>
    (score.get(b.id) ?? 0) - (score.get(a.id) ?? 0)
  const byFav = (a: PopularRegion, b: PopularRegion) => b.favoriteCount - a.favoriteCount
  const cmp: Record<PopularSort, (a: PopularRegion, b: PopularRegion) => number> = {
    favorites: (a, b) => byFav(a, b) || byScore(a, b),
    views: (a, b) => b.viewCount - a.viewCount || byFav(a, b),
    score: (a, b) => byScore(a, b) || byFav(a, b),
  }
  return [...items].sort(cmp[sort])
}

/** 지형 필터. 빈 필터는 모두 통과, 아니면 하나라도 겹치면 통과 */
export function terrainMatch(item: { terrain: Terrain[] }, terrains: Terrain[]): boolean {
  if (terrains.length === 0) return true
  return item.terrain.some((t) => terrains.includes(t))
}

/** 정렬 기준 상위 3개 배지 */
export function rankBadge(sort: PopularSort, index: number): string | undefined {
  if (index > 2) return undefined
  return `${SORT_BADGE_PREFIX[sort]} ${index + 1}위`
}
