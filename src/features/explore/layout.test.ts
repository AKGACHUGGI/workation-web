import { describe, expect, it } from 'vitest'
import { indexGraph } from '@/features/explore/indexGraph'
import {
  FADED_OPACITY,
  graphEdges,
  layoutBranches,
  spotlightPaths,
} from '@/features/explore/layout'
import type { GeoGeometry, PolygonGeometry } from '@/components/map/geo'
import { exploreGraphMock } from '@/mocks/explore/graph'

const index = indexGraph(exploreGraphMock)
const jumunjin = index.dongById.get('5115025000')!
const d2 = (a: { lat: number; lng: number }, b: { lat: number; lng: number }) =>
  (a.lat - b.lat) ** 2 + (a.lng - b.lng) ** 2

describe('layoutBranches', () => {
  const layout = layoutBranches(index, jumunjin, ['beach', 'coast', 'cafe', 'island'])

  it('branch 태그만 허브, 태그 순서(cafe → beach)', () => {
    expect(layout.hubs.map((h) => h.tagId)).toEqual(['cafe', 'beach'])
    expect(layout.hubs[0].label).toBe('카페 많음')
    expect(layout.hubs[0].group).toBe('work')
  })
  it('가지당 5개 + 나머지 수', () => {
    const [cafe, beach] = layout.hubs
    expect([cafe.count, cafe.places.length, cafe.more]).toEqual([7, 5, 2])
    expect([beach.count, beach.places.length, beach.more]).toEqual([3, 3, 0])
  })
  it('표시 장소는 중심에서 가까운 순', () => {
    const ds = layout.hubs[0].places.map((p) => d2(layout.center, p))
    expect(ds).toEqual([...ds].sort((a, b) => a - b))
  })
  it('허브 위치 = 중심과 그 태그 장소 무게중심의 중간', () => {
    const cafes = exploreGraphMock.places.filter(
      (p) => p.dongId === jumunjin.id && p.tag === 'cafe',
    )
    const mean = cafes.reduce((s, p) => s + p.lat, 0) / cafes.length
    expect(layout.hubs[0].position.lat).toBeCloseTo((jumunjin.center!.lat + mean) / 2, 4)
  })
  it('badge 태그는 가지 없이 배지 (바닷가는 해안 거리)', () => {
    expect(layout.badges).toEqual([{ tagId: 'coast', text: '바닷가 · 해안 0.4km' }])
  })
  it('장소 없는 branch 태그는 허브 없이 missing', () => {
    expect(layout.missing).toEqual(['island'])
  })
  it('태그 없이 열면 중심만', () => {
    const empty = layoutBranches(index, jumunjin, [])
    expect([empty.hubs, empty.badges, empty.missing]).toEqual([[], [], []])
    expect(empty.center).toEqual(jumunjin.center)
  })
})

describe('graphEdges', () => {
  const layout = layoutBranches(index, jumunjin, ['cafe', 'beach'])

  it('중심→허브 5px, 허브→장소 2px, 묶음 색', () => {
    const edges = graphEdges(layout, null)
    expect(edges).toHaveLength(2 + 5 + 3)
    const trunk = edges.find((e) => e.key === 'trunk:cafe')!
    expect([trunk.width, trunk.color, trunk.opacity]).toEqual([
      5,
      'var(--color-explore-group-work)',
      1,
    ])
    expect(edges.filter((e) => e.key.startsWith('twig:')).every((e) => e.width === 2)).toBe(true)
  })
  it('장소 선택: 그 가지 4px, 다른 가지·핀 선은 흐리게', () => {
    const selected = layout.hubs[1].places[0]
    const edges = graphEdges(layout, selected)
    expect(edges.find((e) => e.key === `twig:${selected.id}`)).toMatchObject({
      width: 4,
      opacity: 1,
    })
    expect(edges.find((e) => e.key === 'trunk:beach')?.opacity).toBe(1)
    expect(edges.find((e) => e.key === 'trunk:cafe')?.opacity).toBe(FADED_OPACITY)
  })
  it('표시 5개 밖의 장소를 고르면 그 장소로 가는 선을 더한다', () => {
    const hidden = exploreGraphMock.places
      .filter((p) => p.dongId === jumunjin.id && p.tag === 'cafe')
      .find((p) => !layout.hubs[0].places.includes(p))!
    expect(
      graphEdges(layout, hidden).some((e) => e.key === `twig:${hidden.id}` && e.width === 4),
    ).toBe(true)
  })
})

describe('spotlightPaths', () => {
  const signedArea = (ring: { lat: number; lng: number }[]) =>
    ring.reduce((s, p, i) => {
      const q = ring[(i + 1) % ring.length]
      return s + (p.lng * q.lat - q.lng * p.lat)
    }, 0)
  const square: PolygonGeometry = {
    type: 'Polygon',
    coordinates: [
      [
        [128.4, 38.4],
        [128.5, 38.4],
        [128.5, 38.5],
        [128.4, 38.5],
        [128.4, 38.4],
      ],
    ],
  }
  it('세계 사각형 + 동 외곽 구멍, 구멍은 바깥과 반대 방향', () => {
    const [world, hole] = spotlightPaths(square)
    expect(world).toHaveLength(6)
    expect(Math.sign(signedArea(world))).toBe(-Math.sign(signedArea(hole)))
  })
  it('MultiPolygon 은 조각마다 구멍', () => {
    const multi: GeoGeometry = {
      type: 'MultiPolygon',
      coordinates: [square.coordinates, square.coordinates],
    }
    expect(spotlightPaths(multi)).toHaveLength(3)
  })
})
