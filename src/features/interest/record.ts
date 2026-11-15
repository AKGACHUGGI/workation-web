import { DEDUP_MS } from '@/features/interest/constants'
import { appendEvent, getAnonId, getEvents } from '@/features/interest/store'
import type { InterestEvent, InterestInput } from '@/features/interest/types'
import { API_BASE_URL } from '@/lib/api'
import { isMock } from '@/lib/mock'

/** 같은 대상의 반복 기록인가 (search 는 질문 문장까지 같아야 같은 대상) */
function sameTarget(e: InterestEvent, input: InterestInput): boolean {
  if (e.kind !== input.kind || e.target !== input.target) return false
  if (e.kind === 'search' && input.kind === 'search') return e.payload.q === input.payload.q
  return true
}

/**
 * 관심 기록 한 건. 브라우저에 쌓고, mock 모드가 아니면 서버(POST /api/events)에도 보낸다.
 * 같은 대상을 DEDUP_MS 안에 다시 기록하면 무시한다. 전송은 기다리지 않고 실패는 무시하며,
 * 어떤 경우에도 throw 하지 않는다 (설계 5-5, 5-6).
 */
export function recordInterest(input: InterestInput): void {
  try {
    const now = Date.now()
    const events = getEvents()
    for (let i = events.length - 1; i >= 0; i--) {
      if (!sameTarget(events[i], input)) continue
      if (now - events[i].at < DEDUP_MS) return
      break
    }
    appendEvent({ ...input, at: now })
    if (isMock) return
    const { kind, target, payload } = input
    fetch(`${API_BASE_URL}/api/events`, {
      method: 'POST',
      keepalive: true,
      credentials: 'include',
      headers: { 'Content-Type': 'application/json', 'X-Requested-With': 'workation-web' },
      body: JSON.stringify({ anonId: getAnonId(), kind, target, payload }),
    }).catch(() => {})
  } catch {
    // 기록 실패는 화면에 영향을 주지 않는다
  }
}
