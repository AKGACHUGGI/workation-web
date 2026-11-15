import { afterEach, beforeEach, expect, test, vi } from 'vitest'
import { recordInterest } from '@/features/interest/record'
import { getAnonId, getEvents } from '@/features/interest/store'
import type { InterestInput, ViewPayload } from '@/features/interest/types'

// isMock 은 모듈 상수이고 테스트 환경은 VITE_USE_MOCK: 'true' 라 getter 로 바꿔 끼운다
const m = vi.hoisted(() => ({ isMock: true }))
vi.mock('@/lib/mock', () => ({
  get isMock() {
    return m.isMock
  },
}))

const MIN = 60_000
const NOW = Date.UTC(2026, 10, 15)
const payload: ViewPayload = { sigunguId: null, snapshot: null }
const regionViewInput: InterestInput = { kind: 'region_view', target: '51150', payload }

beforeEach(() => {
  localStorage.clear()
  vi.useRealTimers()
  m.isMock = true
})

afterEach(() => {
  localStorage.clear()
  vi.useRealTimers()
  vi.restoreAllMocks()
  vi.unstubAllGlobals()
})

test('storage failure yields no events and no throw', () => {
  vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
    throw new Error('blocked')
  })
  vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
    throw new Error('blocked')
  })
  expect(() => recordInterest(regionViewInput)).not.toThrow()
  expect(getEvents()).toEqual([])
})

test('dedups same target within 30 minutes', () => {
  vi.useFakeTimers({ toFake: ['Date'] })
  vi.setSystemTime(NOW)
  recordInterest(regionViewInput)
  vi.setSystemTime(NOW + 29 * MIN)
  recordInterest(regionViewInput)
  expect(getEvents()).toHaveLength(1)
  vi.setSystemTime(NOW + 31 * MIN)
  recordInterest(regionViewInput)
  expect(getEvents()).toHaveLength(2)
})

test('posts event to server', () => {
  m.isMock = false
  const fetchMock = vi.fn().mockResolvedValue(new Response(null, { status: 204 }))
  vi.stubGlobal('fetch', fetchMock)
  recordInterest(regionViewInput)
  expect(fetchMock).toHaveBeenCalledTimes(1)
  const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit]
  expect(url.endsWith('/api/events')).toBe(true)
  expect(init.method).toBe('POST')
  expect(JSON.parse(init.body as string)).toEqual({
    anonId: getAnonId(),
    kind: 'region_view',
    target: '51150',
    payload,
  })
})

test('server failure is swallowed', async () => {
  m.isMock = false
  const fetchMock = vi.fn().mockRejectedValue(new TypeError('network'))
  vi.stubGlobal('fetch', fetchMock)
  expect(() => recordInterest(regionViewInput)).not.toThrow()
  // 거부된 Promise 가 처리되지 않은 채 남지 않는지 한 틱 기다린다
  await Promise.resolve()
  expect(fetchMock).toHaveBeenCalledTimes(1)
  expect(getEvents()).toHaveLength(1)
})

test('skips server in mock mode', () => {
  m.isMock = true
  const fetchMock = vi.fn()
  vi.stubGlobal('fetch', fetchMock)
  recordInterest(regionViewInput)
  expect(fetchMock).not.toHaveBeenCalled()
  expect(getEvents()).toHaveLength(1)
})
