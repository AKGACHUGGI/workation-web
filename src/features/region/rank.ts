import type { Grade } from '@/features/metric/types'
import { buildTiers } from '@/features/tier/buildTiers'
import type { TierItem, TierMode } from '@/features/tier/types'

export type RankResult = {
  score: number // 반올림 전. 표시는 Math.round
  rank: number // 1부터. 같은 점수는 같은 순위
  total: number
  grade: Grade
  item: TierItem
}

/**
 * W-02 와 같은 buildTiers 로 등급을 매긴 뒤, S→C 순서로 펼쳐 id 의 순위를 찾는다.
 * id 가 items 에 없으면 null (마스킹·특수시설 제외 동).
 */
export function rankIn(items: TierItem[], id: string, mode: TierMode): RankResult | null {
  const entries = buildTiers(items, mode).flatMap((g) =>
    g.entries.map((e) => ({ ...e, grade: g.grade })),
  )
  const index = entries.findIndex((e) => e.item.id === id)
  if (index < 0) return null
  const mine = entries[index]
  const rank = entries.findIndex((e) => e.score === mine.score) + 1
  return { score: mine.score, rank, total: items.length, grade: mine.grade, item: mine.item }
}
