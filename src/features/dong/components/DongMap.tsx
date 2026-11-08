import { useCallback, useState } from 'react'
import { AdvancedMarker, Map as GoogleMap } from '@vis.gl/react-google-maps'
import { MapPin } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { bboxToBounds, centroid } from '@/components/map/geo'
import type { GeoFeatureCollection, PolygonStyle } from '@/components/map/geo'
import GoogleMapProvider from '@/components/map/GoogleMapProvider'
import MapPlaceholder from '@/components/map/MapPlaceholder'
import { hasMapsKey, mapsMapId } from '@/components/map/mapsKey'
import PolygonLayer from '@/components/map/PolygonLayer'
import { DONG_COPY } from '@/features/dong/copy'
import type { DongDetailResponse } from '@/features/dong/types'
import { METRIC_LABEL } from '@/features/metric/constants'
import type { Grade } from '@/features/metric/types'
import DetailSection from '@/features/region/components/DetailSection'
import { carryQuery } from '@/hooks/carryQuery'

type Props = {
  detail: DongDetailResponse
  geo: GeoFeatureCollection | undefined
  quietGrade: Grade | null
}

const CURRENT: PolygonStyle = {
  fill: 'var(--color-brand-primary)',
  stroke: 'var(--color-brand-hover)',
  strokeWidth: 2,
  fillOpacity: 0.35,
}
const OTHER: PolygonStyle = {
  fill: 'var(--color-gray-300)',
  stroke: 'var(--color-border-strong)',
  strokeWidth: 1,
  fillOpacity: 0,
}

/**
 * 스펙 §3-6 위치. 키 없음·로드 실패는 GoogleMapProvider 가 MapPlaceholder 로 바꾼다.
 * 폴리곤 파일이 없으면(빈 컬렉션) 폴리곤 없이 마커만 그린다.
 */
export default function DongMap({ detail, geo, quietGrade }: Props) {
  const navigate = useNavigate()
  const [hoverCurrent, setHoverCurrent] = useState(false)
  const landmarks = detail.landmarks.join(' · ')
  const keyed = hasMapsKey()
  const feature = geo?.features.find((f) => f.properties.id === detail.id)
  const center = feature
    ? centroid(feature.geometry)
    : { lat: (detail.bbox[1] + detail.bbox[3]) / 2, lng: (detail.bbox[0] + detail.bbox[2]) / 2 }
  // 스펙 §3-6: 현재 동 hover 툴팁 `{name} · 동네 조용함 {grade}`
  const tooltip = quietGrade ? `${detail.name} · ${METRIC_LABEL.quiet} ${quietGrade}` : detail.name

  const getStyle = useCallback((id: string) => (id === detail.id ? CURRENT : OTHER), [detail.id])
  const onClick = useCallback(
    (id: string) => {
      if (id !== detail.id)
        navigate(carryQuery(`/dongs/${id}`, new URLSearchParams(window.location.search)))
    },
    [detail.id, navigate],
  )
  const onHover = useCallback((id: string | null) => setHoverCurrent(id === detail.id), [detail.id])

  return (
    <DetailSection title={DONG_COPY.mapTitle} titleId="map-title" caption={detail.accessNote}>
      {/* 키가 없으면 Figma MiniMap(251:3808)처럼 낮은 회색 박스, 키가 있으면 지도 320px */}
      <div className={`relative w-full overflow-hidden rounded-xl ${keyed ? 'h-80' : ''}`}>
        <GoogleMapProvider
          fallback={<MapPlaceholder title={DONG_COPY.mapNoKey}>{landmarks}</MapPlaceholder>}
        >
          <GoogleMap
            mapId={mapsMapId()}
            defaultBounds={bboxToBounds(detail.bbox)}
            gestureHandling="cooperative"
            disableDefaultUI
            zoomControl
            style={{ width: '100%', height: '100%' }}
          >
            {geo && geo.features.length > 0 && (
              <PolygonLayer
                features={geo}
                getStyle={getStyle}
                onClick={onClick}
                onHover={onHover}
              />
            )}
            <AdvancedMarker position={center} title={tooltip}>
              <span className="text-text-primary flex flex-col items-center">
                <span className="bg-bg-surface text-caption-xs shadow-float rounded-md px-2 py-0.5 font-bold">
                  {detail.name}
                </span>
                <MapPin className="text-brand-primary" size={28} aria-hidden />
              </span>
            </AdvancedMarker>
          </GoogleMap>
          {hoverCurrent && (
            <div
              role="tooltip"
              className="bg-bg-surface text-caption-xs text-text-primary shadow-float pointer-events-none absolute top-3 left-3 rounded-lg px-3 py-2"
            >
              {tooltip}
            </div>
          )}
        </GoogleMapProvider>
      </div>
      {keyed && <p className="text-body-sm text-text-secondary">{landmarks}</p>}
    </DetailSection>
  )
}
