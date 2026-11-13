import { useCallback, useMemo, useState } from 'react'
import { APILoadingStatus, Map as GoogleMap, useApiLoadingStatus } from '@vis.gl/react-google-maps'
import PolygonLayer from '@/components/map/PolygonLayer'
import type { GeoFeatureCollection } from '@/components/map/geo'
import { mapsMapId } from '@/components/map/mapsKey'
import CameraController from '@/features/explore/components/CameraController'
import DongPinLayer from '@/features/explore/components/DongPinLayer'
import MapLegend from '@/features/explore/components/MapLegend'
import MapSkeleton from '@/features/explore/components/MapSkeleton'
import PinSkeletonLayer from '@/features/explore/components/PinSkeletonLayer'
import SigunguLayer from '@/features/explore/components/SigunguLayer'
import { EXPLORE_COPY, legendTags } from '@/features/explore/copy'
import { DONG_BOUNDARY_STYLE } from '@/features/explore/mapStyle'
import { pinSkeletons } from '@/features/explore/pinSkeletons'
import type { PinDong } from '@/features/explore/types'
import { useDelayedLoading } from '@/features/explore/useDelayedLoading'
import { DEFAULT_BOUNDS } from '@/features/explore/view'
import type { CameraCommand } from '@/features/explore/view'
import { useSigunguGeoQuery } from '@/features/heatmap/useSigunguGeoQuery'

type Props = {
  sgg: string | null
  pins: PinDong[] | undefined
  pinsLoading: boolean
  /** 고른 시군구 행정동 경계 (useGeoQuery). 핀 스켈레톤 위치·경계선 */
  geo: GeoFeatureCollection | undefined
  hoveredDong: string | null
  selectedDong: string | null
  onPickSigungu: (id: string) => void
  onPickDong: (id: string) => void
  onHoverDong: (id: string | null) => void
  camera: CameraCommand | null
}

const dongBoundaryStyle = () => DONG_BOUNDARY_STYLE

/**
 * W-09 지도 (⓪ 시군구 히트맵 색 / ① 행정동 핀). GoogleMapProvider 안에서만 렌더된다
 * (키 없음 → 페이지가 MapPlaceholder). SDK 로딩 중에는 MapSkeleton (스펙 §9-1)
 */
export default function ExploreMap({
  sgg,
  pins,
  pinsLoading,
  geo,
  hoveredDong,
  selectedDong,
  onPickSigungu,
  onPickDong,
  onHoverDong,
  camera,
}: Props) {
  const status = useApiLoadingStatus()
  const sigunguGeo = useSigunguGeoQuery()
  const [hoveredSgg, setHoveredSgg] = useState<string | null>(null)
  const skeletons = useMemo(() => (geo ? pinSkeletons(geo) : []), [geo])
  const showPinSkeleton = useDelayedLoading(sgg !== null && pinsLoading)
  const tags = useMemo(() => legendTags(pins ?? []), [pins])

  // ① 안쪽(행정동 경계·빈 땅)을 눌러도 같은 시군구가 다시 push 되지 않게 한다
  const pickSigungu = useCallback(
    (id: string) => {
      if (id !== sgg) onPickSigungu(id)
    },
    [sgg, onPickSigungu],
  )

  if (status !== APILoadingStatus.LOADED) return <MapSkeleton />

  const hoveredName =
    sgg === null && hoveredSgg
      ? sigunguGeo.data?.features.find((f) => f.properties.id === hoveredSgg)?.properties.name
      : undefined

  return (
    <div className="relative h-full w-full">
      <GoogleMap
        mapId={mapsMapId()}
        defaultBounds={DEFAULT_BOUNDS}
        gestureHandling="greedy"
        disableDefaultUI
        zoomControl
        clickableIcons={false}
        style={{ width: '100%', height: '100%' }}
      >
        <CameraController camera={camera} />
        <SigunguLayer
          activeSgg={sgg}
          hovered={hoveredSgg}
          onPick={pickSigungu}
          onHover={setHoveredSgg}
        />
        {sgg && geo && <PolygonLayer features={geo} getStyle={dongBoundaryStyle} />}
        {sgg && pins && (
          <DongPinLayer
            pins={pins}
            hoveredDong={hoveredDong}
            selectedDong={selectedDong}
            onPickDong={onPickDong}
            onHoverDong={onHoverDong}
          />
        )}
        {sgg && !pins && showPinSkeleton && <PinSkeletonLayer skeletons={skeletons} />}
      </GoogleMap>

      {hoveredName && (
        <div
          role="tooltip"
          className="bg-bg-inverse text-text-inverse shadow-float pointer-events-none absolute top-4 left-4 flex items-baseline gap-1.5 rounded-lg px-3 py-2"
        >
          <span className="text-body-sm font-bold">{EXPLORE_COPY.sigunguTip(hoveredName)}</span>
          <span className="text-caption-xs">{EXPLORE_COPY.sigunguTipSub}</span>
        </div>
      )}

      <div className="pointer-events-none absolute bottom-9 left-4">
        <div className="pointer-events-auto">
          <MapLegend stage={sgg ? 'pins' : 'overview'} tags={tags} />
        </div>
      </div>
    </div>
  )
}
