import { useCallback } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useToast } from '@/components/ui/toast/useToast'
import { useRequireLogin } from '@/features/auth/useRequireLogin'
import { dongKeys } from '@/features/dong/queryKeys'
import { votePoll } from '@/features/region/api'
import { applyVote, nextVote } from '@/features/region/pollVote'
import { regionKeys } from '@/features/region/queryKeys'
import type { PollChoice, PollResponse, PollTarget } from '@/features/region/types'

export const VOTE_FAILED = '투표를 저장하지 못했어요. 잠시 후 다시 시도해 주세요'

/** useDongPollQuery 처럼 동은 annual 을 최신 달(2025-12)로 조회·투표한다 */
function effective(t: PollTarget): PollTarget {
  return t.kind === 'dongs' && t.month === 'annual' ? { ...t, month: '2025-12' } : t
}

/** useRegionPollQuery·useDongPollQuery 와 같은 키 */
function pollKey(t: PollTarget) {
  return t.kind === 'regions'
    ? regionKeys.poll(t.id, { month: t.month, preset: t.preset })
    : dongKeys.poll(t.id, t.month)
}

/**
 * 체감 투표 토글. 비로그인이면 로그인 모달만 연다.
 * 같은 쪽 다시 누르기 → 취소, 반대쪽 → 변경. 낙관적 갱신 → POST → 응답으로 확정, 실패 시 롤백 + 토스트
 */
export function useVotePollMutation(target: PollTarget | undefined) {
  const queryClient = useQueryClient()
  const requireLogin = useRequireLogin()
  const { show } = useToast()
  const key = target ? pollKey(effective(target)) : null

  const mutation = useMutation({
    mutationFn: ({ t, choice }: { t: PollTarget; choice: PollChoice | null }) =>
      votePoll(t, choice),
    // 연타해도 순서대로 보낸다 — 늦게 끝난 앞 요청이 뒤 요청의 결과를 덮지 않게
    scope: key ? { id: JSON.stringify(key) } : undefined,
    onMutate: async ({ t, choice }) => {
      const k = pollKey(t)
      await queryClient.cancelQueries({ queryKey: k })
      const prev = queryClient.getQueryData<PollResponse>(k)
      if (prev) queryClient.setQueryData<PollResponse>(k, applyVote(prev, choice))
      return { prev }
    },
    onError: (_err, { t }, ctx) => {
      if (ctx?.prev) queryClient.setQueryData(pollKey(t), ctx.prev)
      show(VOTE_FAILED)
    },
    onSuccess: (data, { t }) => {
      queryClient.setQueryData(pollKey(t), data)
    },
  })

  // 렌더 시점이 아니라 누른 시점의 캐시로 다음 상태를 고른다 (연타·로그인 후 재개에도 맞게)
  return useCallback(
    (clicked: PollChoice) => {
      if (!target) return
      const t = effective(target)
      requireLogin(() => {
        const current = queryClient.getQueryData<PollResponse>(pollKey(t))?.myVote
        mutation.mutate({ t, choice: nextVote(current, clicked) })
      })
    },
    [target, requireLogin, queryClient, mutation],
  )
}
