import { NO_BOOST, personalize } from '@/features/interest'
import type { BoostFn } from '@/features/interest'
import { composite } from '@/features/metric/score'
import { GRADES } from '@/features/metric/types'
import type { Grade, Weights } from '@/features/metric/types'
import { SORT_BADGE_PREFIX } from '@/features/popular/copy'
import type { PopularRegion, PopularSort, Terrain } from '@/features/popular/types'

export type PersonalScore = { score: number; grade: Grade }

/** 목록 전체의 개인 종합 점수·등급 (id 별). 카드 표시와 정렬이 같은 값을 쓴다 */
export function personalPopular(
  items: PopularRegion[],
  weights: Weights,
  boost: BoostFn = NO_BOOST,
): Map<string, PersonalScore> {
  const base = items.map((i) => composite(i.scores, weights))
  const boosts = items.map((i) => boost({ id: i.id, scores: i.scores, terrain: i.terrain }))
  const personal = personalize(base, boosts)
  return new Map(items.map((i, k) => [i.id, personal[k]]))
}

/** 정렬 기준별 비교. 새 배열을 돌려준다. 종합 순서는 (개인 등급 S→C, 개인 점수 내림차순) */
export function sortPopular(
  items: PopularRegion[],
  sort: PopularSort,
  weights: Weights,
  boost: BoostFn = NO_BOOST,
): PopularRegion[] {
  const personal = personalPopular(items, weights, boost)
  const rankOf = (id: string) => GRADES.indexOf(personal.get(id)?.grade ?? 'C')
  const byScore = (a: PopularRegion, b: PopularRegion) =>
    rankOf(a.id) - rankOf(b.id) ||
    (personal.get(b.id)?.score ?? 0) - (personal.get(a.id)?.score ?? 0)
  const byFav = (a: PopularRegion, b: PopularRegion) => b.favoriteCount - a.favoriteCount
  const cmp: Record<PopularSort, (a: PopularRegion, b: PopularRegion) => number> = {
    favorites: (a, b) => byFav(a, b) || byScore(a, b),
    views: (a, b) => b.viewCount - a.viewCount || byFav(a, b) || byScore(a, b),
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
