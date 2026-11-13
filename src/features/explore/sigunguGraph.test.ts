import { describe, expect, it } from 'vitest'
import {
  DEFAULT_RELATIONS,
  RELATIONS,
  buildSigunguGraph,
  factDongs,
  seedPosition,
  sharedFacts,
} from '@/features/explore/sigunguGraph'
import type { RelationKey } from '@/features/explore/sigunguGraph'
import { pinsMock } from '@/mocks/explore/pins'

const pins = pinsMock('51150')!.dongs
const YEONGOK = '5115037000'
const name = (id: string) => pins.find((p) => p.id === id)!.name

describe('RELATIONS', () => {
  it('이름은 사실 노드에 맞춘다, 토글은 조용함·저녁 활기 등급 2개뿐', () => {
    expect(RELATIONS.map((r) => r.label)).toEqual([
      '워케이션 유형',
      '바닷가',
      '생활권/관광지',
      '조용함 등급',
      '저녁 활기 등급',
    ])
    expect(RELATIONS.filter((r) => r.toggle).map((r) => r.key)).toEqual(['quiet', 'evening'])
  })
  it('기본 켬 = 항상 켜진 세 관계 (토글 칩은 꺼짐)', () => {
    expect([...DEFAULT_RELATIONS]).toEqual(['type', 'coast', 'life'])
  })
})

describe('buildSigunguGraph', () => {
  it('강릉 기본 관계: 동 21 + 사실 6(유형 3·바닷가·생활권·관광지), 선 47, 시군구 노드 없음', () => {
    const g = buildSigunguGraph(pins, DEFAULT_RELATIONS)
    expect(g.nodes.filter((n) => n.kind === 'dong')).toHaveLength(21)
    expect(g.nodes.filter((n) => n.kind !== 'dong').map((n) => n.id)).toEqual([
      'type:네트워킹형',
      'type:로컬살이형',
      'type:몰입형',
      'coast',
      'life:관광지',
      'life:생활권',
    ])
    expect(g.links).toHaveLength(16 + 10 + 21)
    expect(g.nodes.some((n) => n.id === '51150' || n.label === '강릉시')).toBe(false)
  })
  it('동 노드: 라벨 = 이름, score = 가장 맞는 유형 점수', () => {
    const g = buildSigunguGraph(pins, DEFAULT_RELATIONS)
    expect(g.nodes.find((n) => n.id === '5115025000')).toEqual({
      id: '5115025000',
      kind: 'dong',
      label: '주문진읍',
      score: 60,
    })
  })
  it('관계를 끄면 그 선과 사실 노드가 빠진다', () => {
    const g = buildSigunguGraph(pins, new Set<RelationKey>(['type', 'life']))
    expect(g.nodes.some((n) => n.id === 'coast')).toBe(false)
    expect(g.links.some((l) => l.rel === 'coast')).toBe(false)
    expect(g.links).toHaveLength(37)
  })
  it('이어진 동이 없는 사실 노드는 만들지 않는다', () => {
    const two = pins.filter((p) => p.id === '5115025000' || p.id === YEONGOK)
    const g = buildSigunguGraph(two, new Set<RelationKey>(['type', 'quiet', 'evening']))
    expect(g.nodes.filter((n) => n.kind !== 'dong').map((n) => n.label)).toEqual([
      '로컬살이형',
      '몰입형',
      '조용함 A',
      '조용함 B',
      '저녁 활기 A',
      '저녁 활기 B',
    ])
  })
})

describe('sharedFacts', () => {
  it('연곡면 → 강동면·경포동·사천면 공통 2 (강릉 실측)', () => {
    const g = buildSigunguGraph(pins, DEFAULT_RELATIONS)
    const top = sharedFacts(g, YEONGOK).slice(0, 3)
    expect(top.map((s) => [s.name, s.common.length])).toEqual([
      ['강동면', 2],
      ['경포동', 2],
      ['사천면', 2],
    ])
    expect(top[0].common).toEqual(['바닷가', '관광지'])
  })
  it('공통 0개 동은 빼고, 자기 자신은 없다', () => {
    const g = buildSigunguGraph(pins, new Set<RelationKey>(['coast']))
    const list = sharedFacts(g, '5115060000') // 내곡동: 바닷가 아님 → 공통 사실 없음
    expect(list).toEqual([])
    expect(sharedFacts(g, YEONGOK).every((s) => s.dongId !== YEONGOK)).toBe(true)
  })
})

describe('factDongs', () => {
  it('바닷가와 이어진 동 10곳', () => {
    const g = buildSigunguGraph(pins, DEFAULT_RELATIONS)
    const ids = factDongs(g, 'coast')
    expect(ids).toHaveLength(10)
    expect(ids.map(name)).toContain('주문진읍')
  })
})

describe('seedPosition', () => {
  it('id 로 정해지는 고정 위치, 범위 안', () => {
    const a = seedPosition('5115025000', 400, 300)
    expect(seedPosition('5115025000', 400, 300)).toEqual(a)
    expect(a.x).toBeGreaterThanOrEqual(0)
    expect(a.x).toBeLessThan(400)
    expect(a.y).toBeGreaterThanOrEqual(0)
    expect(a.y).toBeLessThan(300)
    expect(seedPosition(YEONGOK, 400, 300)).not.toEqual(a)
  })
})
