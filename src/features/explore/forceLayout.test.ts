import { describe, expect, it } from 'vitest'
import { DONG_R, FACT_R, createLayout, nodeRadius } from '@/features/explore/forceLayout'
import { DEFAULT_RELATIONS, buildSigunguGraph } from '@/features/explore/sigunguGraph'
import { GANGNEUNG_PINS } from '@/test/fixtures/explore'

const W = 399
const H = 400
const on = new Set(DEFAULT_RELATIONS)
const graph = buildSigunguGraph(GANGNEUNG_PINS, on)

describe('nodeRadius', () => {
  it('동은 점수와 상관없이 같은 크기, 사실은 고정 26', () => {
    expect(nodeRadius({ id: 'a', kind: 'dong', label: 'a', score: 61 })).toBe(DONG_R)
    expect(nodeRadius({ id: 'a', kind: 'dong', label: 'a', score: 97 })).toBe(DONG_R)
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
