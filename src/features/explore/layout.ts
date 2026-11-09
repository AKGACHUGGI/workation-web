import { toLatLngPaths } from '@/components/map/geo'
import type { GeoGeometry } from '@/components/map/geo'
import { EXPLORE_COPY, GROUP_META } from '@/features/explore/copy'
import { hasTag, placesOf } from '@/features/explore/indexGraph'
import type { GraphIndex } from '@/features/explore/indexGraph'
import type { ExploreDong, ExplorePlace, LatLng, TagGroup } from '@/features/explore/types'

/** 가지당 지도에 그리는 장소 수 (나머지는 `+N곳 더`) */
export const BRANCH_PLACE_LIMIT = 5
/** ③ 고르지 않은 가지·핀 (토큰 --opacity-faded 와 같은 값. Maps API 는 숫자만 받는다) */
export const FADED_OPACITY = 0.4

export type Hub = {
  tagId: string
  label: string
  group: TagGroup
  /** 그 동·태그 장소 수 (= placeCount) */
  count: number
  position: LatLng
  /** 중심에서 가까운 순 최대 5 */
  places: ExplorePlace[]
  more: number
}

export type BranchLayout = {
  center: LatLng
  hubs: Hub[]
  /** 고른 badge 태그 중 그 동이 가진 것 → 중심 노드 아래 */
  badges: { tagId: string; text: string }[]
  /** 고른 branch 태그인데 그 동 장소가 0곳 → 패널 "이 동네엔 … 장소가 없어요" */
  missing: string[]
}

export type GraphEdge = {
  key: string
  from: LatLng
  to: LatLng
  color: string
  width: number
  opacity: number
}

const round5 = (n: number) => Math.round(n * 1e5) / 1e5
const at = (p: ExplorePlace): LatLng => ({ lat: p.lat, lng: p.lng })

function dist2(a: LatLng, b: LatLng): number {
  const k = Math.cos((a.lat * Math.PI) / 180)
  return (a.lat - b.lat) ** 2 + ((a.lng - b.lng) * k) ** 2
}

function centerOf(dong: ExploreDong): LatLng {
  if (dong.center) return dong.center
  const [w, s, e, n] = dong.bbox
  return { lat: (s + n) / 2, lng: (w + e) / 2 }
}

/** ② 동 중심 그래프 배치 (스펙 §3-3). 태그 순서는 응답 tags 순서 */
export function layoutBranches(
  index: GraphIndex,
  dong: ExploreDong,
  tagIds: string[],
): BranchLayout {
  const center = centerOf(dong)
  const layout: BranchLayout = { center, hubs: [], badges: [], missing: [] }
  for (const tag of index.res.tags) {
    if (!tagIds.includes(tag.id)) continue
    if (tag.display === 'badge') {
      if (!hasTag(dong, tag.id)) continue
      const text =
        tag.id === 'coast' && dong.coastKm !== null
          ? EXPLORE_COPY.coastBadge(tag.label, dong.coastKm)
          : tag.label
      layout.badges.push({ tagId: tag.id, text })
      continue
    }
    const places = placesOf(index, dong.id, tag.id)
    if (places.length === 0) {
      layout.missing.push(tag.id)
      continue
    }
    const sorted = [...places].sort(
      (a, b) => dist2(center, at(a)) - dist2(center, at(b)) || a.id.localeCompare(b.id),
    )
    const meanLat = places.reduce((s, p) => s + p.lat, 0) / places.length
    const meanLng = places.reduce((s, p) => s + p.lng, 0) / places.length
    layout.hubs.push({
      tagId: tag.id,
      label: tag.label,
      group: tag.group,
      count: places.length,
      position: {
        lat: round5((center.lat + meanLat) / 2),
        lng: round5((center.lng + meanLng) / 2),
      },
      places: sorted.slice(0, BRANCH_PLACE_LIMIT),
      more: Math.max(0, places.length - BRANCH_PLACE_LIMIT),
    })
  }
  return layout
}

/** 가지 선. ③ 에서는 고른 장소의 가지만 진하게(4px), 나머지는 흐리게 */
export function graphEdges(layout: BranchLayout, selected: ExplorePlace | null): GraphEdge[] {
  const selectedHub = selected ? layout.hubs.find((h) => h.tagId === selected.tag) : undefined
  return layout.hubs.flatMap((hub) => {
    const color = GROUP_META[hub.group].color
    const active = !selectedHub || selectedHub === hub
    const trunk: GraphEdge = {
      key: `trunk:${hub.tagId}`,
      from: layout.center,
      to: hub.position,
      color,
      width: 5,
      opacity: active ? 1 : FADED_OPACITY,
    }
    const targets =
      selected && selectedHub === hub && !hub.places.some((p) => p.id === selected.id)
        ? [...hub.places, selected]
        : hub.places
    const twigs = targets.map<GraphEdge>((p) => {
      const isSelected = p.id === selected?.id
      return {
        key: `twig:${p.id}`,
        from: hub.position,
        to: at(p),
        color,
        width: isSelected ? 4 : 2,
        opacity: !selected || isSelected ? 1 : FADED_OPACITY,
      }
    })
    return [trunk, ...twigs]
  })
}

/** Maps 폴리곤이 날짜변경선에서 뒤집히지 않도록 ±179.99 로 둔 세계 사각형 (시계 방향) */
const WORLD: LatLng[] = [
  { lat: 85, lng: -179.99 },
  { lat: 85, lng: 0 },
  { lat: 85, lng: 179.99 },
  { lat: -85, lng: 179.99 },
  { lat: -85, lng: 0 },
  { lat: -85, lng: -179.99 },
]

function signedArea(ring: LatLng[]): number {
  let s = 0
  for (let i = 0; i < ring.length; i++) {
    const p = ring[i]
    const q = ring[(i + 1) % ring.length]
    s += p.lng * q.lat - q.lng * p.lat
  }
  return s
}

/** 스포트라이트: 세계를 덮고 선택 동만 구멍으로 뚫는다. 구멍은 바깥과 반대 방향이어야 비워진다 */
export function spotlightPaths(geometry: GeoGeometry): LatLng[][] {
  const outerSign = Math.sign(signedArea(WORLD))
  const holes = toLatLngPaths(geometry).map((ring) =>
    Math.sign(signedArea(ring)) === outerSign ? [...ring].reverse() : ring,
  )
  return [WORLD, ...holes]
}
