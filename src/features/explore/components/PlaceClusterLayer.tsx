import { useEffect } from 'react'
import { MarkerClusterer } from '@googlemaps/markerclusterer'
import { useMap, useMapsLibrary } from '@vis.gl/react-google-maps'
import { GROUP_META } from '@/features/explore/copy'
import type { GraphIndex } from '@/features/explore/indexGraph'
import { clusterElement, pinElement } from '@/features/explore/pinDom'
import type { ExplorePlace } from '@/features/explore/types'

type Props = {
  index: GraphIndex
  /** 고른 태그. null 이면 모든 핀을 진하게 (태그 선택 전) */
  highlightTags: string[] | null
  onSelect: (place: ExplorePlace) => void
}

/** 줌 14+ 장소 핀 + 클러스터 (스펙 §3 표, Figma Explore/Cluster) */
export default function PlaceClusterLayer({ index, highlightTags, onSelect }: Props) {
  const map = useMap()
  const markerLib = useMapsLibrary('marker')

  useEffect(() => {
    if (!map || !markerLib) return
    const markers = index.res.places.map((p) => {
      const tag = index.tagById.get(p.tag)
      const color = tag ? GROUP_META[tag.group].color : 'var(--color-text-primary)'
      const faded = highlightTags !== null && !highlightTags.includes(p.tag)
      const marker = new markerLib.AdvancedMarkerElement({
        position: { lat: p.lat, lng: p.lng },
        content: pinElement(p.name, color, faded),
        title: p.name,
      })
      marker.addListener('click', () => onSelect(p))
      return marker
    })
    const clusterer = new MarkerClusterer({
      map,
      markers,
      renderer: {
        render: ({ count, position }) =>
          new markerLib.AdvancedMarkerElement({ position, content: clusterElement(count) }),
      },
    })
    return () => {
      clusterer.clearMarkers()
      clusterer.setMap(null)
      markers.forEach((m) => (m.map = null))
    }
  }, [map, markerLib, index, highlightTags, onSelect])

  return null
}
