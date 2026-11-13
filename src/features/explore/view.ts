import { toLatLngPaths } from '@/components/map/geo'
import type { GeoFeatureCollection } from '@/components/map/geo'
import type { Bounds, LatLng } from '@/features/explore/types'

export type { Bounds }

/** 지도에 보낼 이동 명령. seq 가 바뀌어야 다시 실행된다 (CameraController) */
export type CameraCommand = { seq: number } & (
  | { kind: 'bounds'; bounds: Bounds; padding: number }
  | { kind: 'view'; center: LatLng; zoom: number }
)

/** ⓪ 첫 진입: 강원 동해안 5개 시군구 (고성~동해, Figma ⓪ 387:8601) */
export const DEFAULT_BOUNDS: Bounds = { west: 128.25, south: 37.4, east: 129.2, north: 38.65 }
/** ① 시군구 경계에 맞출 때 패딩(px) */
export const SIGUNGU_PADDING = 40

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
