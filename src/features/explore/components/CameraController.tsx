import { useEffect } from 'react'
import { useMap } from '@vis.gl/react-google-maps'
import type { CameraCommand } from '@/features/explore/view'

/** 페이지가 보낸 이동 명령을 지도에 적용한다. 지도가 늦게 준비돼도 마지막 명령을 실행한다 */
export default function CameraController({ camera }: { camera: CameraCommand | null }) {
  const map = useMap()
  useEffect(() => {
    if (!map || !camera) return
    if (camera.kind === 'bounds') map.fitBounds(camera.bounds, camera.padding)
    else map.moveCamera({ center: camera.center, zoom: camera.zoom })
  }, [map, camera])
  return null
}
