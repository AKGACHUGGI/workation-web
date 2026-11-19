import { applyVote } from '@/features/region/pollVote'
import type { PollChoice, PollResponse, PollTarget } from '@/features/region/types'
import { getDongPollMock } from '@/mocks/dong'
import { getPollMock } from '@/mocks/region'

/**
 * POST /api/{kind}/{id}/poll/vote mock. mock GET 집계에 내 표를 얹어 돌려준다.
 * 내 표는 응답으로 채운 쿼리 캐시에만 남는다(GET mock 은 내 표를 모름 — 캐시가 만료돼 다시 받으면 사라진다)
 */
export function votePollMock(target: PollTarget, choice: PollChoice | null): PollResponse {
  const base =
    target.kind === 'regions'
      ? getPollMock(target.id, target.month, target.preset)
      : getDongPollMock(target.id, target.month)
  return applyVote({ ...base, myVote: null }, choice)
}
