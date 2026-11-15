import { act, renderHook } from '@testing-library/react'
import { afterEach, beforeEach, expect, test, vi } from 'vitest'
import { STORAGE_KEY } from '@/features/interest/constants'
import { recordInterest } from '@/features/interest/record'
import type { InterestEvent, InterestInput } from '@/features/interest/types'
import { useBoost } from '@/features/interest/useBoost'
import type { MetricScores } from '@/features/metric/types'

const QUIET: MetricScores = { quiet: 95, crowd: 90, peer: 30, overnight: 60, vibe: 10 }
const regionView: InterestInput = {
  kind: 'region_view',
  target: '51150',
  payload: { sigunguId: null, snapshot: null },
}

beforeEach(() => {
  localStorage.clear()
  vi.useRealTimers()
})

afterEach(() => {
  localStorage.clear()
  vi.useRealTimers()
})

test('useBoost returns zero without events', () => {
  const { result } = renderHook(useBoost)
  expect(result.current({ id: '51150', scores: QUIET, terrain: ['coast'] })).toBe(0)
  expect(result.current({ id: '46770', sigunguId: '46770', scores: QUIET })).toBe(0)
})

test('useBoost updates after record', () => {
  const { result } = renderHook(useBoost)
  act(() => recordInterest(regionView))
  expect(result.current({ id: '51150', scores: QUIET })).toBeGreaterThan(0)
})

test('useBoost reacts to storage event', () => {
  const { result } = renderHook(useBoost)
  expect(result.current({ id: '51150', scores: QUIET })).toBe(0)
  const event: InterestEvent = { ...regionView, at: Date.now() } as InterestEvent
  // 다른 탭이 기록을 쓴 것처럼 저장소를 직접 바꾸고 storage 이벤트를 보낸다
  localStorage.setItem(STORAGE_KEY, JSON.stringify({ anonId: 'other-tab', events: [event] }))
  act(() => {
    window.dispatchEvent(new StorageEvent('storage', { key: STORAGE_KEY }))
  })
  expect(result.current({ id: '51150', scores: QUIET })).toBeGreaterThan(0)
})

test('useBoost live false stays fixed', () => {
  const { result } = renderHook(() => useBoost({ live: false }))
  act(() => recordInterest(regionView))
  expect(result.current({ id: '51150', scores: QUIET })).toBe(0)
})

test('useBoost refreezes on key change', () => {
  const { result, rerender } = renderHook(({ k }) => useBoost({ live: false, freezeKey: k }), {
    initialProps: { k: 'A' },
  })
  act(() => recordInterest(regionView))
  expect(result.current({ id: '51150', scores: QUIET })).toBe(0)
  rerender({ k: 'B' })
  expect(result.current({ id: '51150', scores: QUIET })).toBeGreaterThan(0)
})
