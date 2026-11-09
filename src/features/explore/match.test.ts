import { describe, expect, it } from 'vitest'
import { indexGraph } from '@/features/explore/indexGraph'
import {
  countOffscreen,
  groupByProvince,
  markerTooltip,
  matchDongs,
  splitByView,
} from '@/features/explore/match'
import { DEFAULT_BOUNDS } from '@/features/explore/view'
import { exploreGraphMock } from '@/mocks/explore/graph'

const index = indexGraph(exploreGraphMock)
const TAGS = ['cafe', 'beach']

describe('matchDongs (스펙 §10 기대값)', () => {
  it('카페 많음 + 해수욕장: 이 화면 any 14 · all 5', () => {
    const any = splitByView(index, matchDongs(index, TAGS, 'any'), DEFAULT_BOUNDS).inView
    const all = splitByView(index, matchDongs(index, TAGS, 'all'), DEFAULT_BOUNDS).inView
    expect(any).toHaveLength(14)
    expect(all.map((m) => index.dongById.get(m.dongId)!.name).sort()).toEqual(
      ['거진읍', '경포동', '송정동', '영랑동', '주문진읍'].sort(),
    )
    expect(all.every((m) => m.all && m.matched.length === 2)).toBe(true)
  })
  it('장소 많은 순: 경포동(13) > 송정동(11) > 주문진읍(10) > 영랑동(7)', () => {
    const all = splitByView(index, matchDongs(index, TAGS, 'all'), DEFAULT_BOUNDS).inView
    expect(all.slice(0, 4).map((m) => index.dongById.get(m.dongId)!.name)).toEqual([
      '경포동',
      '송정동',
      '주문진읍',
      '영랑동',
    ])
    expect(all[2].placeTotal).toBe(10)
  })
  it('태그가 없으면 빈 배열, 집계 제외 동은 빠진다', () => {
    expect(matchDongs(index, [], 'any')).toEqual([])
    const idx = indexGraph({
      ...exploreGraphMock,
      dongs: exploreGraphMock.dongs.map((d) =>
        d.id === '5115025000' ? { ...d, excluded: true as const } : d,
      ),
    })
    expect(matchDongs(idx, TAGS, 'all').some((m) => m.dongId === '5115025000')).toBe(false)
  })
})

describe('화면 밖 도 칩', () => {
  it('any: 전북 8 · 전남 5 · 제주 4 (많은 순)', () => {
    const groups = countOffscreen(index, matchDongs(index, TAGS, 'any'), DEFAULT_BOUNDS)
    expect(groups.map((g) => [g.name, g.count])).toEqual([
      ['전북특별자치도', 8],
      ['전라남도', 5],
      ['제주특별자치도', 4],
    ])
    expect(groups[0].short).toBe('전북')
  })
  it('groupByProvince 의 bounds 는 그 도 해당 동 bbox 합', () => {
    const [jeonbuk] = groupByProvince(
      index,
      matchDongs(index, TAGS, 'any').filter((m) => m.dongId.startsWith('52')),
    )
    expect(jeonbuk.bounds.south).toBeLessThan(jeonbuk.bounds.north)
  })
})

describe('markerTooltip', () => {
  it('branch 는 짧은 이름 + 수, badge 는 이름만', () => {
    const d = index.dongById.get('5115025000')!
    expect(markerTooltip(index, d, ['coast', 'cafe', 'beach'])).toEqual({
      title: '주문진읍 · 바닷가 · 카페 7 · 해수욕장 3',
      hint: '누르면 주문진읍 중심 그래프로 확대',
    })
  })
})
