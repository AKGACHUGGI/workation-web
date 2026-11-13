import { useEffect, useRef, useState } from 'react'
import type { GeoFeatureCollection } from '@/components/map/geo'
import { DEFAULT_BOUNDS, SIGUNGU_PADDING, geoBounds } from '@/features/explore/view'
import type { CameraCommand } from '@/features/explore/view'

/**
 * ⓪ = 기본 범위, ① = 고른 시군구 행정동 경계 + 패딩 (스펙 §3-1 "그 경계로 확대").
 * 경계 파일이 오기 전에는 이전 명령을 유지한다. ②(dong) 는 카메라를 움직이지 않는다
 */
export function useExploreCamera(
  sgg: string | null,
  geo: GeoFeatureCollection | undefined,
): CameraCommand | null {
  const [camera, setCamera] = useState<CameraCommand | null>(null)
  const seq = useRef(0)

  useEffect(() => {
    const bounds = sgg ? (geo ? geoBounds(geo) : null) : DEFAULT_BOUNDS
    if (!bounds) return
    seq.current += 1
    setCamera({ seq: seq.current, kind: 'bounds', bounds, padding: sgg ? SIGUNGU_PADDING : 0 })
  }, [sgg, geo])

  return camera
}
