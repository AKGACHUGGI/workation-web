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

/** 스냅숏 없던 조회(지도 탐색) 뒤 같은 대상을 스냅숏과 함께 다시 보면 중복으로 보지 않는다 */
function addsSnapshot(prev: InterestEvent, input: InterestInput): boolean {
  return (
    prev.kind !== 'search' &&
    input.kind !== 'search' &&
    prev.payload.snapshot === null &&
    input.payload.snapshot !== null
  )
}

/**
 * 관심 기록 한 건. 브라우저에 쌓고, mock 모드가 아니면 서버(POST /api/events)에도 보낸다.
 * 같은 대상을 DEDUP_MS 안에 다시 기록하면 무시한다(스냅숏이 새로 생기는 경우는 제외). 전송은 기다리지 않고 실패는 무시하며,
 * 어떤 경우에도 throw 하지 않는다 (설계 5-5, 5-6).
 */
export function recordInterest(input: InterestInput): void {
  try {
    const now = Date.now()
    const events = getEvents()
    for (let i = events.length - 1; i >= 0; i--) {
      if (!sameTarget(events[i], input)) continue
      if (now - events[i].at < DEDUP_MS && !addsSnapshot(events[i], input)) return
      break
    }
    // 로컬 저장이 막히면 중복 제거가 꺼지고 anonId 도 새로고침마다 바뀌므로 서버 전송도 건너뛴다
    if (!appendEvent({ ...input, at: now })) return
    if (isMock) return
    const { kind, target, payload } = input
    fetch(`${API_BASE_URL}/api/events`, {
      method: 'POST',
      keepalive: true,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ anonId: getAnonId(), kind, target, payload }),
    }).catch(() => {})
  } catch {
    // 기록 실패는 화면에 영향을 주지 않는다
  }
}
