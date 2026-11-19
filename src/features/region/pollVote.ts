import type { PollChoice, PollResponse } from '@/features/region/types'

/** 같은 쪽을 다시 누르면 취소(null), 아니면 그쪽으로 투표·변경 */
export function nextVote(current: PollChoice | null | undefined, clicked: PollChoice) {
  return current === clicked ? null : clicked
}

/** 내 표를 빼고 새 표를 더한 집계. 낙관적 갱신과 mock 이 같이 쓴다 */
export function applyVote(poll: PollResponse, next: PollChoice | null): PollResponse {
  const prev = poll.myVote ?? null
  if (prev === next) return poll
  const delta = (side: PollChoice) => (next === side ? 1 : 0) - (prev === side ? 1 : 0)
  const yes = Math.max(0, poll.yes + delta('yes'))
  const no = Math.max(0, poll.no + delta('no'))
  return {
    ...poll,
    yes,
    no,
    total: Math.max(0, poll.total + delta('yes') + delta('no')),
    myVote: next,
  }
}
