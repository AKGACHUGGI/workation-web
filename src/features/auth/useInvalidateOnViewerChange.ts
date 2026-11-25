import { useEffect, useRef } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import type { Me } from '@/features/auth/types'

/**
 * 점수 응답이 보는 사람(연령대)에 따라 달라지는 쿼리인지. 키 팩토리 2026-11-23 기준 화이트리스트.
 * 채팅 기록·geo·notes·poll·['auth','me'] 는 제외한다
 */
export function isScoreQuery(key: readonly unknown[]): boolean {
  const [head, second, third] = key
  if (head === 'tier' || head === 'popular') return true // tierKeys.list, popularKeys.list
  if ((head === 'region' || head === 'dong') && key.length === 3 && typeof third === 'object')
    return true // regionKeys.detail, dongKeys.detail (notes·poll 은 3번째가 문자열이라 제외)
  if (head === 'me' && second === 'favorites' && typeof third === 'object') return true // meKeys.favorites
  return false
}

/**
 * 같은 페이지에서 보는 사람의 기준(사용자·연령대)이 바뀌면 점수 쿼리만 무효화한다.
 * undefined(첫 조회 중)는 비교하지 않고, 처음 확정된 값은 기준으로만 삼는다
 * (첫 로드 응답은 lib/api.ts 가 붙인 토큰으로 이미 개인화돼 있다)
 */
export function useInvalidateOnViewerChange(me: Me | null | undefined): void {
  const queryClient = useQueryClient()
  const baseRef = useRef<string | null>(null)
  const key = me === undefined ? undefined : me ? `${me.id}:${me.ageGroup ?? ''}` : 'anon'

  useEffect(() => {
    if (key === undefined) return
    if (baseRef.current === null) {
      baseRef.current = key
      return
    }
    if (baseRef.current === key) return
    baseRef.current = key
    void queryClient.invalidateQueries({ predicate: (q) => isScoreQuery(q.queryKey) })
  }, [key, queryClient])
}
