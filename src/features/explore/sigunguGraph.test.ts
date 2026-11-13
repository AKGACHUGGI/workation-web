import { describe, expect, it } from 'vitest'
import {
  SIGUNGU_NODE,
  buildSigunguGraph,
  pinFacts,
  sharedFacts,
  typeDongs,
  typeNodeId,
} from '@/features/explore/sigunguGraph'
import type { PinDong } from '@/features/explore/types'
import { GANGNEUNG_PINS, JUMUNJIN_ID, WANGSAN_ID, YEONGOK_ID } from '@/test/fixtures/explore'

const byId = (id: string) => GANGNEUNG_PINS.find((p) => p.id === id)!
const NONE = ['강동면', '사천면', '성산면', '옥계면', '왕산면']

describe('buildSigunguGraph', () => {
  const g = buildSigunguGraph('강릉시', GANGNEUNG_PINS)

  it('노드: 시군구 1 → 유형 3 (몰입 → 네트워킹 → 로컬) → 동 21, 등급·생활 노드 없음', () => {
    expect(g.nodes[0]).toEqual({ id: SIGUNGU_NODE, kind: 'sigungu', label: '강릉시' })
    expect(g.nodes.filter((n) => n.kind === 'type').map((n) => n.id)).toEqual([
      'type:몰입형',
      'type:네트워킹형',
      'type:로컬살이형',
    ])
    expect(g.nodes.filter((n) => n.kind === 'dong')).toHaveLength(21)
    expect(g.nodes).toHaveLength(25)
    expect(g.nodes.find((n) => n.id === JUMUNJIN_ID)).toEqual({
      id: JUMUNJIN_ID,
      kind: 'dong',
      label: '주문진읍',
      type: '로컬살이형',
    })
  })

  it('선: 시군구─유형 3 · 유형─동 16 (실선), 시군구─유형 없는 동 5 (점선)', () => {
    expect(g.links).toHaveLength(24)
    expect(g.links.filter((l) => l.source === SIGUNGU_NODE && !l.dashed)).toHaveLength(3)
    expect(g.links.filter((l) => l.source.startsWith('type:'))).toHaveLength(16)
    const dashed = g.links.filter((l) => l.dashed)
    expect(dashed.every((l) => l.source === SIGUNGU_NODE)).toBe(true)
    expect(dashed.map((l) => byId(l.target).name).sort()).toEqual(NONE)
    expect(g.links).toContainEqual({
      source: typeNodeId('몰입형'),
      target: YEONGOK_ID,
      dashed: false,
    })
  })

  it('이어진 동이 없는 유형은 노드도 선도 없다', () => {
    const local = GANGNEUNG_PINS.filter((p) => p.topType === '로컬살이형')
    const only = buildSigunguGraph('강릉시', local)
    expect(only.nodes.filter((n) => n.kind === 'type').map((n) => n.label)).toEqual(['로컬살이형'])
    expect(only.links.some((l) => l.target === typeNodeId('몰입형'))).toBe(false)
  })
})

describe('pinFacts', () => {
  it('대표 유형 · 바닷가 · 생활권/관광지 · 조용함 · 저녁 활기 순, 없는 것은 뺀다', () => {
    expect(pinFacts(byId(YEONGOK_ID))).toEqual([
      '몰입형',
      '바닷가',
      '관광지',
      '조용함 A',
      '저녁 활기 B',
    ])
    expect(pinFacts(byId(WANGSAN_ID))).toEqual(['관광지', '조용함 C', '저녁 활기 C'])
  })
})

describe('sharedFacts', () => {
  it('연곡면 → 공통 3: 강동면 · 사천면 · 송정동 (핀 데이터, 같으면 이름 순)', () => {
    const top = sharedFacts(GANGNEUNG_PINS, YEONGOK_ID).slice(0, 3)
    expect(top.map((s) => [s.name, s.common.length])).toEqual([
      ['강동면', 3],
      ['사천면', 3],
      ['송정동', 3],
    ])
    expect(top[0].common).toEqual(['바닷가', '관광지', '저녁 활기 B'])
    expect(top[2].common).toEqual(['몰입형', '바닷가', '조용함 A'])
  })
  it('공통 0개 동은 빼고, 자기 자신은 없고, 없는 동이면 빈 목록', () => {
    const odd: PinDong = {
      ...byId('5115060000'), // 내곡동: 로컬살이형 · 내륙 · 생활권
      grades: { quiet: 'S', evening: 'S' },
    }
    expect(sharedFacts([byId(YEONGOK_ID), odd], YEONGOK_ID)).toEqual([])
    expect(sharedFacts(GANGNEUNG_PINS, YEONGOK_ID).every((s) => s.dongId !== YEONGOK_ID)).toBe(true)
    expect(sharedFacts(GANGNEUNG_PINS, '0000000000')).toEqual([])
  })
})

describe('typeDongs', () => {
  it('로컬살이형 동 10곳 (핀 순서)', () => {
    const dongs = typeDongs(GANGNEUNG_PINS, '로컬살이형')
    expect(dongs).toHaveLength(10)
    expect(dongs.map((p) => p.name)).toContain('주문진읍')
  })
})
