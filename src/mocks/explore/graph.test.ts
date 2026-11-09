import { describe, expect, it } from 'vitest'
import { TAG_ORDER } from '@/features/explore/copy'
import { exploreGraphMock as g } from '@/mocks/explore/graph'

const JUMUNJIN = '5115025000'

describe('exploreGraphMock 계약 규칙 (스펙 §6)', () => {
  it('태그 12개, 표시 순서, food 없음', () => {
    expect(g.tags.map((t) => t.id)).toEqual([...TAG_ORDER])
  })
  it('branch placeCount = 같은 응답 places 수, badge 는 null', () => {
    const display = new Map(g.tags.map((t) => [t.id, t.display]))
    for (const d of g.dongs) {
      for (const t of d.tags) {
        const n = g.places.filter((p) => p.dongId === d.id && p.tag === t.tagId).length
        if (display.get(t.tagId) === 'badge') expect(t.placeCount).toBeNull()
        else expect(t.placeCount).toBe(n)
      }
    }
  })
  it('places·dongs·sigungu·provinces 는 id 문자열 순', () => {
    const sorted = (ids: string[]) => [...ids].sort()
    expect(g.places.map((p) => p.id)).toEqual(sorted(g.places.map((p) => p.id)))
    expect(g.dongs.map((d) => d.id)).toEqual(sorted(g.dongs.map((d) => d.id)))
    expect(g.sigungu.map((s) => s.id)).toEqual(sorted(g.sigungu.map((s) => s.id)))
    expect(g.provinces.map((p) => p.id)).toEqual(sorted(g.provinces.map((p) => p.id)))
  })
  it('장소 태그는 branch 태그만, 장소는 소속 동이 응답에 있다', () => {
    const branch = new Set(g.tags.filter((t) => t.display === 'branch').map((t) => t.id))
    const dongIds = new Set(g.dongs.map((d) => d.id))
    for (const p of g.places) {
      expect(branch.has(p.tag)).toBe(true)
      expect(dongIds.has(p.dongId)).toBe(true)
    }
  })
  it('similar 는 최대 5개, 자기 자신 없음', () => {
    for (const d of g.dongs) {
      expect(d.similar.length).toBeLessThanOrEqual(5)
      expect(d.similar).not.toContain(d.id)
    }
  })
})

describe('시안 기대값 (스펙 §10)', () => {
  it('주문진읍: 카페 7 · 해수욕장 3, 등급 S·A·B, 해안 0.4km', () => {
    const d = g.dongs.find((x) => x.id === JUMUNJIN)!
    expect(d.name).toBe('주문진읍')
    expect(d.tags.find((t) => t.tagId === 'cafe')?.placeCount).toBe(7)
    expect(d.tags.find((t) => t.tagId === 'beach')?.placeCount).toBe(3)
    expect(d.grades).toEqual({ quiet: 'S', peer: 'A', evening: 'B' })
    expect(d.coastKm).toBe(0.4)
    expect(d.similar.slice(0, 3)).toEqual(['5182025300', '5121051000', '5011025000'])
    const cafes = g.places
      .filter((p) => p.dongId === JUMUNJIN && p.tag === 'cafe')
      .map((p) => p.name)
    expect(cafes).toContain('주문진항 로스터리')
  })
  it('성산면은 등급 없음', () => {
    expect(g.dongs.find((x) => x.id === '5115031000')?.grades).toBeNull()
  })
})
