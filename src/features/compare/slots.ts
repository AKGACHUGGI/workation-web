import { MAX_COMPARE } from '@/features/compare/params'

/** 화면의 비교 칸 3개. 동 id 또는 빈 칸(null) */
export type Slots = (string | null)[]

/**
 * 목록(ids)이 바뀌어도 남은 동은 제자리를 지킨다.
 * 빠진 동의 칸은 빈 칸으로 남고(카드가 그 자리에서 빈 칸으로 바뀐다), 새 동은 앞쪽 빈 칸부터 채운다.
 */
export function reconcileSlots(prev: Slots, ids: readonly string[]): Slots {
  const next: Slots = Array.from({ length: MAX_COMPARE }, (_, i) => {
    const id = prev[i] ?? null
    return id !== null && ids.includes(id) ? id : null
  })
  for (const id of ids) {
    if (next.includes(id)) continue
    const hole = next.indexOf(null)
    if (hole >= 0) next[hole] = id
  }
  return next
}
