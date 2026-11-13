import { centroid } from '@/components/map/geo'
import type { GeoFeatureCollection } from '@/components/map/geo'
import type { LatLng } from '@/features/explore/types'

export type PinSkeleton = { id: string; position: LatLng }

/**
 * ① 핀 로딩 중 회색 알약 위치 (스펙 §7·§9-1). 핀 응답 전에 경계 파일만으로 안다.
 * 경계 파일의 라벨 점(폴리곤 안쪽)을 쓰고, 없으면 첫 고리 중심
 */
export function pinSkeletons(geo: GeoFeatureCollection): PinSkeleton[] {
  return geo.features.map((f) => {
    const { id, labelLat, labelLng } = f.properties
    const position =
      labelLat !== undefined && labelLng !== undefined
        ? { lat: labelLat, lng: labelLng }
        : centroid(f.geometry)
    return { id, position }
  })
}
