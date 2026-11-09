import { useEffect, useMemo } from 'react'
import { AdvancedMarker, useMap } from '@vis.gl/react-google-maps'
import { resolveToken } from '@/components/map/geo'
import GraphNode from '@/features/explore/components/GraphNode'
import PlacePin from '@/features/explore/components/PlacePin'
import { GROUP_META, TAG_ICON } from '@/features/explore/copy'
import { graphEdges } from '@/features/explore/layout'
import type { BranchLayout } from '@/features/explore/layout'
import type { ExploreDong, ExplorePlace } from '@/features/explore/types'

type Props = {
  dong: ExploreDong
  layout: BranchLayout
  selectedPlace: ExplorePlace | null
  onOpenPlace: (placeId: string, dongId: string) => void
  onMore: (tagId: string) => void
}

/** ② 동 중심 그래프: 가지는 Polyline, 노드·핀은 AdvancedMarker (스펙 §3-3, §3-4) */
export default function DongGraphOverlay({
  dong,
  layout,
  selectedPlace,
  onOpenPlace,
  onMore,
}: Props) {
  const map = useMap()
  const edges = useMemo(() => graphEdges(layout, selectedPlace), [layout, selectedPlace])

  useEffect(() => {
    if (!map) return
    const lines = edges.map(
      (e) =>
        new google.maps.Polyline({
          map,
          path: [e.from, e.to],
          strokeColor: resolveToken(e.color),
          strokeWeight: e.width,
          strokeOpacity: e.opacity,
          clickable: false,
          zIndex: e.width,
        }),
    )
    return () => lines.forEach((l) => l.setMap(null))
  }, [map, edges])

  const pins = layout.hubs.flatMap((hub) => {
    const extra =
      selectedPlace &&
      selectedPlace.tag === hub.tagId &&
      !hub.places.some((p) => p.id === selectedPlace.id)
        ? [selectedPlace]
        : []
    return [...hub.places, ...extra].map((place) => ({ hub, place }))
  })

  return (
    <>
      <AdvancedMarker position={layout.center} zIndex={30}>
        <GraphNode kind="dong" label={dong.name} badges={layout.badges.map((b) => b.text)} />
      </AdvancedMarker>
      {layout.hubs.map((hub) => (
        <AdvancedMarker key={hub.tagId} position={hub.position} zIndex={20}>
          <GraphNode
            kind="tag"
            label={`${hub.label} · ${hub.count}`}
            color={GROUP_META[hub.group].color}
            more={hub.more}
            onMore={() => onMore(hub.tagId)}
          />
        </AdvancedMarker>
      ))}
      {pins.map(({ hub, place }) => {
        const selected = place.id === selectedPlace?.id
        return (
          <AdvancedMarker
            key={place.id}
            position={{ lat: place.lat, lng: place.lng }}
            zIndex={selected ? 40 : 10}
            onClick={() => onOpenPlace(place.id, dong.id)}
          >
            <PlacePin
              name={place.name}
              color={GROUP_META[hub.group].color}
              icon={TAG_ICON[hub.tagId]}
              selected={selected}
              dimmed={Boolean(selectedPlace) && !selected}
            />
          </AdvancedMarker>
        )
      })}
    </>
  )
}
