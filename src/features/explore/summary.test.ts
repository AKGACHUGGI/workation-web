import { describe, expect, it } from 'vitest'
import { indexGraph } from '@/features/explore/indexGraph'
import { dongAreaLabel, sigunguAreaLabel, summarizeTags } from '@/features/explore/summary'
import { DEFAULT_BOUNDS } from '@/features/explore/view'
import { exploreGraphMock } from '@/mocks/explore/graph'

const index = indexGraph(exploreGraphMock)

describe('summarizeTags', () => {
  it('태그 순서대로 범위 안 동 수, 범위 밖 동은 제외', () => {
    const rows = summarizeTags(index, DEFAULT_BOUNDS)
    expect(rows.map((r) => r.tag.id)).toHaveLength(12)
    expect(rows.find((r) => r.tag.id === 'cafe')?.count).toBe(11)
    expect(rows.find((r) => r.tag.id === 'beach')?.count).toBe(8)
    expect(rows.find((r) => r.tag.id === 'island')?.count).toBe(0)
  })
})

describe('영역 라벨 (⓪)', () => {
  it('행정동: `{이름} · 카페 n · 숙소 n` (숙소 = 장기 숙소 + 리조트)', () => {
    expect(dongAreaLabel(index.dongById.get('5115066500')!)).toBe('경포동 · 카페 11 · 숙소 6')
  })
  it('시군구: 앞에 동 수', () => {
    expect(sigunguAreaLabel(index, '51820')).toBe('고성군 · 동 5 · 카페 3 · 숙소 6')
  })
})
