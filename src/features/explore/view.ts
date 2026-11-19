import { toLatLngPaths } from '@/components/map/geo'
import type { GeoFeatureCollection } from '@/components/map/geo'
import type { Bounds, LatLng } from '@/features/explore/types'

export type { Bounds }

/** 지도에 보낼 이동 명령. seq 가 바뀌어야 다시 실행된다 (CameraController) */
export type CameraCommand = {
  seq: number
  /** 이동 시간(ms). 0 이면 바로. 지도의 첫 명령·움직임 줄이기 설정이면 무시하고 바로. hop 하면 HOP_MS */
  duration: number
  /**
   * 축소 → 이동 → 확대 (fly-to). always = 동 → 다른 동,
   * far = 시군구 → 다른 시군구 (목표 가운데가 지금 화면 밖일 때만, 아니면 그냥 보간). null = 보간만
   */
  hop: 'always' | 'far' | null
  /** 지금 시군구의 ① 범위 (축소 감지 기준, ZOOM_OUT_EXIT). ⓪ 이면 null */
  sigungu: { bounds: Bounds; padding: number } | null
} & (
  | { kind: 'bounds'; bounds: Bounds; padding: number }
  | { kind: 'view'; center: LatLng; zoom: number }
)

/**
 * ⓪ 첫 진입: 대한민국 전체. 위아래는 평양 위 ~ 제주 아래 여유까지(보통 화면에선 높이가 줌을 정한다),
 * 좌우는 가운데가 경도 126.85 쯤 오게 두고 좁은 화면에서도 울릉도까지 들어오게 잡았다
 */
export const DEFAULT_BOUNDS: Bounds = { west: 122.7, south: 32.5, east: 131.0, north: 39.5 }
/** ① 시군구 경계에 맞출 때 패딩(px) */
export const SIGUNGU_PADDING = 40
/** ⓪ ↔ ①, ② → ① 이동 시간(ms) */
export const SIGUNGU_FLY_MS = 750
/** ① → ② 동 확대 시간(ms). 시군구보다 조금 천천히 */
export const DONG_FLY_MS = 850
/** 축소 → 이동 → 확대(hop) 전체 시간(ms): ② 동 → 다른 동(비슷한 동 등), 먼 시군구 → 시군구 */
export const HOP_MS = 1300
/** ② 동 핀을 가운데 두고 볼 줌 */
export const DONG_ZOOM = 13
/** ①·② 에서 사용자가 ① 에 맞춘 줌보다 이만큼(단계) 넘게 줄이면 ⓪ 으로 돌아간다 */
export const ZOOM_OUT_EXIT = 1.25

/** 경계 파일 전체를 감싸는 범위. 비어 있으면 null */
export function geoBounds(geo: GeoFeatureCollection): Bounds | null {
  const pts = geo.features.flatMap((f) => toLatLngPaths(f.geometry).flat())
  if (pts.length === 0) return null
  const lngs = pts.map((p) => p.lng)
  const lats = pts.map((p) => p.lat)
  return {
    west: Math.min(...lngs),
    south: Math.min(...lats),
    east: Math.max(...lngs),
    north: Math.max(...lats),
  }
}

/** 경계 파일에서 id 하나의 범위. 없으면 null */
export function featureBounds(geo: GeoFeatureCollection, id: string): Bounds | null {
  return geoBounds({ ...geo, features: geo.features.filter((f) => f.properties.id === id) })
}
