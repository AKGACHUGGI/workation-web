import { useEffect, useMemo, useRef, useState } from 'react'
import type { GeoFeatureCollection } from '@/components/map/geo'
import type { PinDong } from '@/features/explore/types'
import {
  DEFAULT_BOUNDS,
  DONG_FLY_MS,
  DONG_ZOOM,
  SIGUNGU_FLY_MS,
  SIGUNGU_PADDING,
  featureBounds,
  geoBounds,
} from '@/features/explore/view'
import type { CameraCommand } from '@/features/explore/view'

/**
 * ⓪ = 기본 범위, ① = 고른 시군구 범위 + 패딩 (스펙 §3-1 "그 경계로 확대"),
 * ② = 그 동 핀을 가운데로 DONG_ZOOM 까지 조금 더 천천히 확대. ② → ① 은 다시 시군구 범위로.
 * ① 범위는 이미 받아 둔 12개 시군구 폴리곤(sigunguGeo)에서 바로 정해 클릭 즉시 움직인다.
 * 그 파일이 아직 없을 때만 행정동 경계(geo)를 기다린다.
 * ② 에서 다른 동(비슷한 동, 다른 시군구일 수 있음)으로 가면 hop, ① 에서 다른 시군구로 가면 멀 때만 hop.
 * 동이 있으면 핀이 올 때까지 기다리고 시군구 범위 명령을 먼저 내지 않는다. 핀에 좌표가 없는 동은 ① 범위
 */
export function useExploreCamera(
  sgg: string | null,
  dong: string | null,
  sigunguGeo: GeoFeatureCollection | undefined,
  geo: GeoFeatureCollection | undefined,
  pins: PinDong[] | undefined,
): CameraCommand | null {
  const [camera, setCamera] = useState<CameraCommand | null>(null)
  const seq = useRef(0)
  /** 마지막 명령이 맞춘 곳. ⓪ 이면 null */
  const shown = useRef<{ sgg: string; dong: string | null } | null>(null)
  const waitingPins = dong !== null && pins === undefined
  const center = dong ? pins?.find((p) => p.id === dong)?.center : null
  const lat = center?.lat
  const lng = center?.lng
  const bounds = useMemo(() => {
    if (!sgg) return null
    return (sigunguGeo && featureBounds(sigunguGeo, sgg)) ?? (geo ? geoBounds(geo) : null)
  }, [sgg, sigunguGeo, geo])
  // 행정동 경계가 늦게 와도 범위가 같으면 다시 움직이지 않게 값으로 비교한다
  const boundsKey = bounds && [bounds.west, bounds.south, bounds.east, bounds.north].join()

  useEffect(() => {
    if (!sgg) {
      shown.current = null
      seq.current += 1
      setCamera({
        seq: seq.current,
        kind: 'bounds',
        bounds: DEFAULT_BOUNDS,
        padding: 0,
        duration: SIGUNGU_FLY_MS,
        hop: null,
        sigungu: null,
      })
      return
    }
    if (!bounds || waitingPins) return
    const sigungu = { bounds, padding: SIGUNGU_PADDING }
    const prev = shown.current
    seq.current += 1
    if (dong && lat !== undefined && lng !== undefined) {
      shown.current = { sgg, dong }
      setCamera({
        seq: seq.current,
        kind: 'view',
        center: { lat, lng },
        zoom: DONG_ZOOM,
        duration: DONG_FLY_MS,
        hop: prev?.dong && prev.dong !== dong ? 'always' : null,
        sigungu,
      })
      return
    }
    shown.current = { sgg, dong: null }
    setCamera({
      seq: seq.current,
      kind: 'bounds',
      ...sigungu,
      duration: SIGUNGU_FLY_MS,
      hop: prev && prev.sgg !== sgg ? 'far' : null,
      sigungu,
    })
    // bounds 는 boundsKey 로 비교한다
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sgg, dong, boundsKey, waitingPins, lat, lng])

  return camera
}
