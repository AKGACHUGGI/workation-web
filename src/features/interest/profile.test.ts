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
  // s ≈ 1, 지표·지형 일치도는 갈래 몫 37.5/50 = 0.75, 장소 일치도 ≈ 1 이라 15 × (0.2·0.75 + 0.1·0.75 + 0.7) = 13.875
  expect(b).toBeCloseTo(13.875, 4)
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

test('old interest does not revive after unrelated record', () => {
  const old = search({ preset: 'quiet', terrain: ['coast'] }, NOW - 30 * DAY)
  const today = search({ preset: 'lively', terrain: [] }, NOW)
  const coast = { id: 'a', scores: QUIET, terrain: ['coast'] as Terrain[] }
  const bare = { id: 'a', scores: QUIET, terrain: [] as Terrain[] }
  // 지형 갈래의 기여만 떼어 본다: 같은 점수에서 coast 가 있을 때와 없을 때의 차
  const terrainPart = (events: InterestEvent[]) => {
    const p = buildProfile(events, NOW)
    return boostFor(p, coast) - boostFor(p, bare)
  }
  const alone = terrainPart([old])
  const after = terrainPart([old, today])
  expect(alone).toBeGreaterThan(0)
  // 오늘의 무관한 기록이 세기를 키워도 30일 전 coast 관심이 원래 크기로 되살아나지 않는다
  expect(after).toBeLessThanOrEqual(alone * 1.5)
})

test('single view stays well below cap', () => {
  const p = buildProfile([regionView('51150', null, NOW)], NOW)
  const b = boostFor(p, { id: '51150', scores: QUIET, terrain: ['coast'] })
  expect(b).toBeLessThanOrEqual(0.35 * 15)
})
