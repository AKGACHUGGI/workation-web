import { afterEach, beforeEach, expect, test, vi } from 'vitest'
import { appendEvent, getAnonId, getEvents } from '@/features/interest/store'
import type { InterestEvent } from '@/features/interest/types'

const DAY = 86_400_000

function view(at: number): InterestEvent {
  return {
    kind: 'region_view',
    target: '51150',
    payload: { sigunguId: null, snapshot: null },
    at,
  }
}

beforeEach(() => {
  localStorage.clear()
  vi.useRealTimers()
})

afterEach(() => {
  localStorage.clear()
  vi.useRealTimers()
})

test('anon id is stable uuid', () => {
  const a = getAnonId()
  const b = getAnonId()
  expect(a).toBe(b)
  expect(a).toMatch(/^[0-9a-f-]{36}$/)
})

test('keeps last 300 events', () => {
  const base = Date.now() - 1000
  for (let i = 0; i < 301; i++) appendEvent(view(base + i))
  const events = getEvents()
  expect(events.length).toBe(300)
  expect(events[0].at).toBe(base + 1)
})

test('drops events older than 60 days', () => {
  const old = Date.now() - 61 * DAY
  const recent = Date.now() - 1000
  appendEvent(view(old))
  appendEvent(view(recent))
  expect(getEvents().map((e) => e.at)).toEqual([recent])
})

const UUID_V4 = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/

test('anon id falls back to getRandomValues without randomUUID', async () => {
  // http LAN 주소처럼 보안 컨텍스트가 아니면 crypto.randomUUID 가 없다
  const real = globalThis.crypto
  vi.stubGlobal('crypto', { getRandomValues: real.getRandomValues.bind(real) })
  try {
    vi.resetModules()
    const fresh = await import('@/features/interest/store')
    const id = fresh.getAnonId()
    expect(id).toMatch(UUID_V4)
    expect(fresh.getAnonId()).toBe(id)
    for (let i = 0; i < 50; i++) expect(fresh.newAnonId()).toMatch(UUID_V4)
  } finally {
    vi.unstubAllGlobals()
  }
})
