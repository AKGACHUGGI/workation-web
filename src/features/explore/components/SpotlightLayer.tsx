import { useEffect, useMemo } from 'react'
import { useMap } from '@vis.gl/react-google-maps'
import { resolveToken, toLatLngPaths } from '@/components/map/geo'
import type { GeoGeometry } from '@/components/map/geo'
import { useGeoQuery } from '@/features/dong/useGeoQuery'
import { spotlightPaths } from '@/features/explore/layout'
import type { BBox, ExploreDong } from '@/features/explore/types'

/** 스펙 §2: 바깥 검정 22%, 경계 검정 3px. 흰색 채우기는 쓰지 않는다 */
const SHADE_OPACITY = 0.22
const OUTLINE_WIDTH = 3

function bboxGeometry([w, s, e, n]: BBox): GeoGeometry {
  return {
    type: 'Polygon',
    coordinates: [
      [
        [w, s],
        [e, s],
        [e, n],
        [w, n],
        [w, s],
      ],
    ],
  }
}

/** ② 선택 동 스포트라이트. 경계 파일이 없으면 bbox 사각형으로 대신한다 */
export default function SpotlightLayer({ dong }: { dong: ExploreDong }) {
  const map = useMap()
  const geo = useGeoQuery(dong.sigunguId)
  const geometry = useMemo(
    () =>
      geo.data?.features.find((f) => f.properties.id === dong.id)?.geometry ??
      bboxGeometry(dong.bbox),
    [geo.data, dong.id, dong.bbox],
  )

  useEffect(() => {
    if (!map) return
    const ink = resolveToken('var(--color-explore-map-spotlight)')
    const shade = new google.maps.Polygon({
      map,
      paths: spotlightPaths(geometry),
      fillColor: ink,
      fillOpacity: SHADE_OPACITY,
      strokeWeight: 0,
      clickable: false,
    })
    const outline = new google.maps.Polygon({
      map,
      paths: toLatLngPaths(geometry),
      fillOpacity: 0,
      strokeColor: ink,
      strokeWeight: OUTLINE_WIDTH,
      clickable: false,
    })
    return () => {
      shade.setMap(null)
      outline.setMap(null)
    }
  }, [map, geometry])

  return null
}
