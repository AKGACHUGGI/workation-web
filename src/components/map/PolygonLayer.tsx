import { useEffect } from 'react'
import { useMap } from '@vis.gl/react-google-maps'
import { centroid, resolveToken, toLatLngPaths } from '@/components/map/geo'
import type { GeoFeatureCollection, PolygonStyle } from '@/components/map/geo'

type Props = {
  features: GeoFeatureCollection
  /** 호출부는 useCallback 으로 고정한다. 참조가 바뀌면 폴리곤을 다시 그린다 (시군구당 ≤ 30개) */
  getStyle: (id: string) => PolygonStyle
  onClick?: (id: string) => void
  onHover?: (id: string | null) => void
  /** 폴리곤 중심에 표시할 라벨 (W-01 히트맵). undefined 면 라벨 없음 */
  getLabel?: (id: string) => string | undefined
}

/** GeoJSON FeatureCollection 을 google.maps.Polygon 으로 그린다. 색은 CSS 변수(토큰)도 받는다 */
export default function PolygonLayer({ features, getStyle, onClick, onHover, getLabel }: Props) {
  const map = useMap()

  useEffect(() => {
    if (!map) return
    const overlays: { setMap(m: google.maps.Map | null): void }[] = []
    for (const f of features.features) {
      const id = f.properties.id
      const style = getStyle(id)
      const polygon = new google.maps.Polygon({
        paths: toLatLngPaths(f.geometry),
        map,
        fillColor: resolveToken(style.fill),
        fillOpacity: style.fillOpacity,
        strokeColor: resolveToken(style.stroke),
        strokeWeight: style.strokeWidth,
        clickable: Boolean(onClick || onHover),
      })
      if (onClick) polygon.addListener('click', () => onClick(id))
      if (onHover) {
        polygon.addListener('mouseover', () => onHover(id))
        polygon.addListener('mouseout', () => onHover(null))
      }
      overlays.push(polygon)

      const text = getLabel?.(id)
      if (text) {
        // mapId 가 필요한 AdvancedMarker 대신 투명 아이콘 + 라벨 Marker 를 쓴다
        const label = new google.maps.Marker({
          position: centroid(f.geometry),
          map,
          clickable: false,
          icon: { path: google.maps.SymbolPath.CIRCLE, scale: 0 },
          label: {
            text,
            fontSize: '12px',
            fontWeight: '700',
            color: resolveToken('var(--color-text-primary)'),
          },
        })
        overlays.push(label)
      }
    }
    return () => overlays.forEach((o) => o.setMap(null))
  }, [map, features, getStyle, onClick, onHover, getLabel])

  return null
}
