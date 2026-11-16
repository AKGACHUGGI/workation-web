import { expect, test } from 'vitest'
import { toChatInterest } from '@/features/interest/chatInterest'
import { buildProfile } from '@/features/interest/profile'
import type { InterestEvent } from '@/features/interest/types'

const DAY = 86_400_000
const NOW = Date.UTC(2026, 10, 17)

function dongView(id: string, sigunguId: string, at: number): InterestEvent {
  return { kind: 'dong_view', target: id, payload: { sigunguId, snapshot: null }, at }
}

test('기록이 없으면 빈 값', () => {
  expect(toChatInterest(buildProfile([], NOW))).toEqual({ metric: {}, terrain: {}, recent: [] })
})

test('0 인 칸은 빼고, recent 는 행정동 코드만 무게 순 3개', () => {
  const events: InterestEvent[] = [
    {
      kind: 'search',
      target: null,
      payload: { q: '', preset: 'quiet', terrain: ['coast'], month: null },
      at: NOW,
    },
    dongView('5115066500', '51150', NOW),
    dongView('5115066500', '51150', NOW - DAY),
    dongView('5115025000', '51150', NOW - 3 * DAY),
    dongView('5211171200', '52111', NOW - 5 * DAY),
    dongView('5115052000', '51150', NOW - 10 * DAY),
  ]
  expect(toChatInterest(buildProfile(events, NOW))).toEqual({
    // PRESET_WEIGHTS.quiet = 3 · 3 · 1 · 1 · 0 을 합 1 로 나눔. vibe 0 은 빠진다
    metric: { quiet: 0.375, crowd: 0.375, peer: 0.125, overnight: 0.125 },
    terrain: { coast: 1 },
    // 시군구 코드 51150 은 무게가 커도 빠진다
    recent: ['5115066500', '5115025000', '5211171200'],
  })
})
