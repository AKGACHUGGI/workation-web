import { expect, test } from 'vitest'
import { boostFor, buildProfile } from '@/features/interest/profile'
import type { InterestEvent, SearchPayload, ViewSnapshot } from '@/features/interest/types'
import type { MetricScores } from '@/features/metric/types'
import type { Terrain } from '@/features/popular/types'

const DAY = 86_400_000
const NOW = Date.UTC(2026, 10, 15)
const HIGH: MetricScores = { quiet: 100, crowd: 100, peer: 100, overnight: 100, vibe: 100 }
const QUIET: MetricScores = { quiet: 95, crowd: 90, peer: 30, overnight: 60, vibe: 10 }
const LIVELY: MetricScores = { quiet: 10, crowd: 20, peer: 90, overnight: 60, vibe: 95 }

function search(p: Partial<SearchPayload>, at: number): InterestEvent {
  return {
    kind: 'search',
    target: null,
    payload: { q: '', preset: null, terrain: [], month: null, ...p },
    at,
  }
}

function regionView(id: string, snapshot: ViewSnapshot | null, at: number): InterestEvent {
  return { kind: 'region_view', target: id, payload: { sigunguId: null, snapshot }, at }
}

function dongView(
  id: string,
  sigunguId: string,
  snapshot: ViewSnapshot | null,
  at: number,
): InterestEvent {
  return { kind: 'dong_view', target: id, payload: { sigunguId, snapshot }, at }
}

const viewAt = (at: number) => regionView('51150', null, at)

test('no events gives zero boost', () => {
  expect(boostFor(buildProfile([], NOW), { id: '51150', scores: HIGH, terrain: ['coast'] })).toBe(0)
})

test('boost never exceeds cap', () => {
  const snapshot: ViewSnapshot = { month: '2025-10', scores: HIGH, terrain: ['coast'] }
  const events: InterestEvent[] = [
    ...Array.from({ length: 25 }, () => search({ preset: 'quiet', terrain: ['coast'] }, NOW)),
    ...Array.from({ length: 25 }, () => regionView('51150', snapshot, NOW)),
  ]
  const b = boostFor(buildProfile(events, NOW), { id: '51150', scores: HIGH, terrain: ['coast'] })
  expect(b).toBeLessThanOrEqual(15)
  expect(b).toBeGreaterThan(14)
})

test('weight halves after half life', () => {
  const p = buildProfile([viewAt(NOW - 7 * DAY)], NOW)
  expect(p.strength).toBeCloseTo(0.5, 6)
})

test('quiet coast search favors quiet coast region', () => {
  const p = buildProfile([search({ preset: 'quiet', terrain: ['coast'] }, NOW)], NOW)
  expect(boostFor(p, { id: 'a', scores: QUIET, terrain: ['coast'] })).toBeGreaterThan(
    boostFor(p, { id: 'b', scores: LIVELY, terrain: ['city'] }),
  )
})

test('dong view boosts that dong, then siblings, then others', () => {
  const p = buildProfile([dongView('5115066500', '51150', null, NOW)], NOW)
  const same = { scores: QUIET, terrain: ['coast'] as Terrain[] }
  const x = boostFor(p, { id: '5115066500', sigunguId: '51150', ...same })
  const sib = boostFor(p, { id: '5115025000', sigunguId: '51150', ...same })
  const other = boostFor(p, { id: '5182025300', sigunguId: '51820', ...same })
  expect(x).toBeGreaterThan(sib)
  expect(sib).toBeGreaterThan(other)
})

test('view without snapshot adds place only', () => {
  const p = buildProfile([regionView('51150', null, NOW)], NOW)
  expect(Object.values(p.metric).every((v) => v === 0)).toBe(true)
  expect(p.place['51150']).toBeCloseTo(1, 6)
})
