import { describe, expect, it } from 'vitest'
import { FACT_R, createLayout, nodeRadius } from '@/features/explore/forceLayout'
import { DEFAULT_RELATIONS, buildSigunguGraph } from '@/features/explore/sigunguGraph'
import { GANGNEUNG_PINS } from '@/test/fixtures/explore'

const W = 399
const H = 400
const on = new Set(DEFAULT_RELATIONS)
const graph = buildSigunguGraph(GANGNEUNG_PINS, on)

describe('nodeRadius', () => {
  it('동은 1위 점수에 비례(Figma: 61 → 지름 14, 97 → 22), 사실은 고정 26', () => {
    expect(nodeRadius({ id: 'a', kind: 'dong', label: 'a', score: 61 })).toBeCloseTo(6.95, 1)
    expect(nodeRadius({ id: 'a', kind: 'dong', label: 'a', score: 97 })).toBeCloseTo(11.06, 1)
    expect(nodeRadius({ id: 'a', kind: 'dong', label: 'a', score: 10 })).toBe(6)
    expect(nodeRadius({ id: 'coast', kind: 'coast', label: '바닷가' })).toBe(FACT_R)
  })
})

describe('createLayout', () => {
  it('같은 데이터면 같은 위치 (씨앗 고정)', () => {
    const a = createLayout(graph, W, H).nodes.map((n) => [n.id, Math.round(n.x), Math.round(n.y)])
    const b = createLayout(graph, W, H).nodes.map((n) => [n.id, Math.round(n.x), Math.round(n.y)])
    expect(a).toEqual(b)
  })
  it('모든 노드가 영역 안 (반지름 + 아래 이름 칸)', () => {
    const { nodes } = createLayout(graph, W, H)
    expect(nodes).toHaveLength(graph.nodes.length)
    for (const n of nodes) {
      expect(n.x).toBeGreaterThanOrEqual(n.r)
      expect(n.x).toBeLessThanOrEqual(W - n.r)
      expect(n.y).toBeGreaterThanOrEqual(n.r)
      expect(n.y).toBeLessThanOrEqual(H - n.r - 14)
    }
  })
  it('원본 graph.links 를 바꾸지 않는다 (d3 가 source/target 을 객체로 바꾸는 것 방지)', () => {
    createLayout(graph, W, H)
    expect(typeof graph.links[0].source).toBe('string')
  })
})
