import type { Grade } from '@/features/metric/types'

export type LatLng = { lat: number; lng: number }
/** google.maps.LatLngBoundsLiteral 과 같은 모양 */
export type Bounds = { west: number; south: number; east: number; north: number }
/** [west, south, east, north] */
export type BBox = [number, number, number, number]

export type TagGroup = 'trait' | 'work' | 'stay' | 'rest' | 'life'
export type TagDisplay = 'branch' | 'badge'
export type MatchMode = 'any' | 'all'

export type ExploreTag = {
  id: string
  label: string
  group: TagGroup
  /** coast·city·mountain = 'badge' (② 중심 노드 아래 배지), 나머지 = 'branch' (가지 + 장소 핀) */
  display: TagDisplay
}

export type ExploreProvince = { id: string; name: string; center: LatLng | null }
export type ExploreSigungu = { id: string; name: string; provinceId: string; center: LatLng | null }

export type DongGrades = { quiet: Grade | null; peer: Grade | null; evening: Grade | null }
/** 그 동이 가진 태그만. badge 태그는 null, branch 태그인데 장소 0곳이면 0 */
export type DongTag = { tagId: string; placeCount: number | null }

export type ExploreDong = {
  id: string
  name: string
  sigunguId: string
  center: LatLng | null
  bbox: BBox
  grades: DongGrades | null
  tags: DongTag[]
  coastKm: number | null
  similar: string[]
  excluded?: true
}

export type ExplorePlace = {
  id: string
  name: string
  dongId: string
  lat: number
  lng: number
  /** branch 태그 하나 */
  tag: string
  image: string | null
}

/** GET /api/explore/graph (스펙 §6) */
export type ExploreGraphResponse = {
  syncedAt: string
  tags: ExploreTag[]
  provinces: ExploreProvince[]
  sigungu: ExploreSigungu[]
  dongs: ExploreDong[]
  places: ExplorePlace[]
}
