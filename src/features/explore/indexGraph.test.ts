import { describe, expect, it } from 'vitest'
import { hasTag, indexGraph, placesOf, provinceOf, tagCount } from '@/features/explore/indexGraph'
import { exploreGraphMock } from '@/mocks/explore/graph'

const index = indexGraph(exploreGraphMock)

describe('indexGraph', () => {
  it('동·태그별 장소 수 = placeCount', () => {
    for (const d of exploreGraphMock.dongs) {
      for (const t of d.tags) {
        if (t.placeCount === null) continue
        expect(placesOf(index, d.id, t.tagId)).toHaveLength(t.placeCount)
      }
    }
  })
  it('태그별 동, id 별 동·장소', () => {
    expect(index.dongsByTag.get('cafe')?.some((d) => d.id === '5115025000')).toBe(true)
    const place = exploreGraphMock.places[0]
    expect(index.placeById.get(place.id)).toBe(place)
    expect(placesOf(index, '5115025000', 'island')).toEqual([])
  })
  it('집계 제외 동은 태그별 동 목록에 없다', () => {
    const res = {
      ...exploreGraphMock,
      dongs: [
        ...exploreGraphMock.dongs,
        { ...exploreGraphMock.dongs[0], id: '9999999999', excluded: true as const },
      ],
    }
    const idx = indexGraph(res)
    expect(idx.dongById.has('9999999999')).toBe(true)
    for (const list of idx.dongsByTag.values())
      expect(list.some((d) => d.id === '9999999999')).toBe(false)
  })
  it('hasTag · tagCount · provinceOf', () => {
    const d = index.dongById.get('5115025000')!
    expect(hasTag(d, 'coast')).toBe(true)
    expect(tagCount(d, 'coast')).toBe(0)
    expect(tagCount(d, 'cafe')).toBe(7)
    expect(provinceOf(index, d)?.name).toBe('강원특별자치도')
  })
})
