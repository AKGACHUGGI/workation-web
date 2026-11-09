import type { GraphIndex } from '@/features/explore/indexGraph'
import type {
  BBox,
  Bounds,
  ExploreDong,
  ExploreProvince,
  ExploreSigungu,
  LatLng,
} from '@/features/explore/types'

export type MapView = { bounds: Bounds; center: LatLng; zoom: number }
export type ZoomStageKey = 'province' | 'sigungu' | 'dong' | 'place'

/** 지도에 보낼 이동 명령. seq 가 바뀌어야 다시 실행된다 */
export type CameraCommand = { seq: number } & (
  | { kind: 'bounds'; bounds: Bounds; padding: number }
  | { kind: 'view'; center: LatLng; zoom: number }
)

/** 확대 단계 칩 (스펙 §3 표). zoom = 칩을 눌렀을 때 갈 줌 */
export const ZOOM_STAGES: { key: ZoomStageKey; label: string; range: string; zoom: number }[] = [
  { key: 'province', label: '도', range: '~8', zoom: 7 },
  { key: 'sigungu', label: '시군구', range: '9~10', zoom: 9 },
  { key: 'dong', label: '행정동', range: '11~13', zoom: 11 },
  { key: 'place', label: '장소', range: '14+', zoom: 14 },
]

/** 첫 진입: 강원 동해안 5개 시군구 (고성~동해) */
export const DEFAULT_BOUNDS: Bounds = { west: 128.25, south: 37.4, east: 129.2, north: 38.65 }
export const DEFAULT_VIEW: MapView = {
  bounds: DEFAULT_BOUNDS,
  center: { lat: 38.025, lng: 128.725 },
  zoom: 9,
}
/** ② 동 bbox 에 맞출 때 패딩 */
export const DONG_PADDING = 80
/** 지도가 멈춘 뒤 경로 바·확대 단계·범위 요약을 갱신하기까지 */
export const VIEW_DEBOUNCE_MS = 200

export function inBounds(p: LatLng, b: Bounds): boolean {
  return p.lat >= b.south && p.lat <= b.north && p.lng >= b.west && p.lng <= b.east
}

export function bboxIntersects([west, south, east, north]: BBox, b: Bounds): boolean {
  return west <= b.east && east >= b.west && south <= b.north && north >= b.south
}

export function bboxToBoundsOf([west, south, east, north]: BBox): Bounds {
  return { west, south, east, north }
}

export function unionBounds(bboxes: BBox[]): Bounds {
  return {
    west: Math.min(...bboxes.map((b) => b[0])),
    south: Math.min(...bboxes.map((b) => b[1])),
    east: Math.max(...bboxes.map((b) => b[2])),
    north: Math.max(...bboxes.map((b) => b[3])),
  }
}

export function zoomStage(zoom: number): ZoomStageKey {
  // 줌은 소수일 수 있어 다음 단계 시작 줌 미만으로 나눈다 (10.5 → 시군구)
  if (zoom < 9) return 'province'
  if (zoom < 11) return 'sigungu'
  if (zoom < 14) return 'dong'
  return 'place'
}

function dongsIn(index: GraphIndex, level: 'province' | 'sigungu', id: string): ExploreDong[] {
  return index.res.dongs.filter((d) => {
    if (level === 'sigungu') return d.sigunguId === id
    return index.sigunguById.get(d.sigunguId)?.provinceId === id
  })
}

/** 경로 바 항목을 눌렀을 때 갈 범위. 소속 동이 없으면 null */
export function areaBounds(
  index: GraphIndex,
  level: 'province' | 'sigungu',
  id: string,
): Bounds | null {
  const dongs = dongsIn(index, level, id)
  return dongs.length > 0 ? unionBounds(dongs.map((d) => d.bbox)) : null
}

/** 줌 11+ 에서 경계 파일을 불러올 시군구 (소속 동 bbox 가 화면에 걸친 것, id 순) */
export function visibleSigunguIds(index: GraphIndex, bounds: Bounds): string[] {
  const ids = new Set<string>()
  for (const d of index.res.dongs) if (bboxIntersects(d.bbox, bounds)) ids.add(d.sigunguId)
  return [...ids].sort()
}

const dist2 = (a: LatLng, b: LatLng) => (a.lat - b.lat) ** 2 + (a.lng - b.lng) ** 2

/**
 * 경로 바 (스펙 §3): 지도 중심이 bbox 안에 드는 동 중 중심이 가장 가까운 것, 없으면 전체에서 가장 가까운 동.
 * (폴리곤 포함 판정 대신 bbox + 중심 거리로 근사한다. 경계 파일 없이 계산하기 위함)
 * 줌 9 이상이면 시군구, 11 이상이면 행정동까지.
 */
export function breadcrumbAt(
  index: GraphIndex,
  center: LatLng,
  zoom: number,
): { province?: ExploreProvince; sigungu?: ExploreSigungu; dong?: ExploreDong } {
  const dongs = index.res.dongs.filter((d) => d.center)
  if (dongs.length === 0) return {}
  const byDistance = (a: ExploreDong, b: ExploreDong) =>
    dist2(center, a.center!) - dist2(center, b.center!)
  const containing = dongs.filter((d) => inBounds(center, bboxToBoundsOf(d.bbox))).sort(byDistance)
  const dong = containing[0] ?? [...dongs].sort(byDistance)[0]
  const sigungu = index.sigunguById.get(dong.sigunguId)
  const province = sigungu ? index.provinceById.get(sigungu.provinceId) : undefined
  return {
    province,
    sigungu: zoom >= 9 ? sigungu : undefined,
    dong: zoom >= 11 && containing.length > 0 ? dong : undefined,
  }
}

export function debounce<A extends unknown[]>(
  fn: (...args: A) => void,
  ms: number,
): ((...args: A) => void) & { cancel: () => void } {
  let timer: ReturnType<typeof setTimeout> | null = null
  const run = (...args: A) => {
    if (timer) clearTimeout(timer)
    timer = setTimeout(() => {
      timer = null
      fn(...args)
    }, ms)
  }
  run.cancel = () => {
    if (timer) clearTimeout(timer)
    timer = null
  }
  return run
}
