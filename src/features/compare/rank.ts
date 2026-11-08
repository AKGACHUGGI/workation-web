import type { TierItem } from '@/features/tier/types'

/** 같은 시군구 행정동 중 동네 조용함(scores.quiet) 순위. 동점은 같은 순위. 없으면 null */
export function rankInSigungu(
  items: TierItem[],
  dongId: string,
): { rank: number; total: number } | null {
  const me = items.find((i) => i.id === dongId)
  if (!me?.sigungu) return null
  const siblings = items.filter((i) => i.sigungu?.id === me.sigungu!.id)
  const higher = siblings.filter((i) => i.scores.quiet > me.scores.quiet).length
  return { rank: higher + 1, total: siblings.length }
}
