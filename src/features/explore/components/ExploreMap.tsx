import { useCallback, useMemo } from 'react'
import { Map as GoogleMap } from '@vis.gl/react-google-maps'
import type { MapEvent } from '@vis.gl/react-google-maps'
import { mapsMapId } from '@/components/map/mapsKey'
import AreaLayer from '@/features/explore/components/AreaLayer'
import CameraController from '@/features/explore/components/CameraController'
import DongGraphOverlay from '@/features/explore/components/DongGraphOverlay'
import PlaceClusterLayer from '@/features/explore/components/PlaceClusterLayer'
import SpotlightLayer from '@/features/explore/components/SpotlightLayer'
import TagMatchMarker from '@/features/explore/components/TagMatchMarker'
import type { GraphIndex } from '@/features/explore/indexGraph'
import type { BranchLayout } from '@/features/explore/layout'
import { groupByProvince } from '@/features/explore/match'
import type { DongMatch } from '@/features/explore/match'
import type { Bounds, ExploreDong, ExplorePlace } from '@/features/explore/types'
import { DEFAULT_BOUNDS, zoomStage } from '@/features/explore/view'
import type { CameraCommand, MapView } from '@/features/explore/view'

type Props = {
  index: GraphIndex
  view: MapView
  camera: CameraCommand | null
  onViewChange: (view: MapView) => void
  tagIds: string[]
  /** 일치 방식까지 적용한 해당 동 (전국) */
  shownMatches: DongMatch[]
  /** 그중 화면 안 */
  inView: DongMatch[]
  selectedDong: ExploreDong | null
  layout: BranchLayout | null
  selectedPlace: ExplorePlace | null
  onOpenDong: (dongId: string) => void
  onOpenPlace: (placeId: string, dongId: string) => void
  onFitBounds: (bounds: Bounds) => void
  onMore: (tagId: string) => void
}

/** W-09 지도. GoogleMapProvider 안에서만 렌더된다 (키 없음 → 페이지가 MapPlaceholder) */
export default function ExploreMap({
  index,
  view,
  camera,
  onViewChange,
  tagIds,
  shownMatches,
  inView,
  selectedDong,
  layout,
  selectedPlace,
  onOpenDong,
  onOpenPlace,
  onFitBounds,
  onMore,
}: Props) {
  const stage = zoomStage(view.zoom)
  const matchedIds = useMemo(() => new Set(shownMatches.map((m) => m.dongId)), [shownMatches])
  const provinceGroups = useMemo(() => groupByProvince(index, shownMatches), [index, shownMatches])
  const highlightTags = tagIds.length > 0 ? tagIds : null

  const handleIdle = useCallback(
    (ev: MapEvent) => {
      const bounds = ev.map.getBounds()?.toJSON()
      const center = ev.map.getCenter()?.toJSON()
      const zoom = ev.map.getZoom()
      if (bounds && center && zoom !== undefined) onViewChange({ bounds, center, zoom })
    },
    [onViewChange],
  )
  const selectPlace = useCallback((p: ExplorePlace) => onOpenPlace(p.id, p.dongId), [onOpenPlace])

  return (
    <GoogleMap
      mapId={mapsMapId()}
      defaultBounds={DEFAULT_BOUNDS}
      onIdle={handleIdle}
      gestureHandling="greedy"
      disableDefaultUI
      zoomControl
      clickableIcons={false}
      style={{ width: '100%', height: '100%' }}
    >
      <CameraController camera={camera} />
      {selectedDong && layout ? (
        <>
          <SpotlightLayer dong={selectedDong} />
          <DongGraphOverlay
            dong={selectedDong}
            layout={layout}
            selectedPlace={selectedPlace}
            onOpenPlace={onOpenPlace}
            onMore={onMore}
          />
        </>
      ) : (
        <>
          <AreaLayer
            index={index}
            stage={stage}
            bounds={view.bounds}
            tagIds={tagIds}
            matchedIds={matchedIds}
            provinceGroups={provinceGroups}
            onFitBounds={onFitBounds}
          />
          {tagIds.length > 0 &&
            (stage === 'sigungu' || stage === 'dong') &&
            inView.map((m) => (
              <TagMatchMarker
                key={m.dongId}
                index={index}
                dong={index.dongById.get(m.dongId)!}
                match={m}
                onOpenDong={onOpenDong}
              />
            ))}
          {stage === 'place' && (
            <PlaceClusterLayer index={index} highlightTags={highlightTags} onSelect={selectPlace} />
          )}
        </>
      )}
    </GoogleMap>
  )
}
