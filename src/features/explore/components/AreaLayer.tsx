import { useCallback, useMemo } from 'react'
import { AdvancedMarker } from '@vis.gl/react-google-maps'
import type { PolygonStyle } from '@/components/map/geo'
import PolygonLayer from '@/components/map/PolygonLayer'
import { EXPLORE_COPY } from '@/features/explore/copy'
import type { GraphIndex } from '@/features/explore/indexGraph'
import type { ProvinceGroup } from '@/features/explore/match'
import { dongAreaLabel, sigunguAreaLabel } from '@/features/explore/summary'
import type { Bounds } from '@/features/explore/types'
import { useVisibleDongGeo } from '@/features/explore/useVisibleDongGeo'
import { visibleSigunguIds } from '@/features/explore/view'
import type { ZoomStageKey } from '@/features/explore/view'
import { useSigunguGeoQuery } from '@/features/heatmap/useSigunguGeoQuery'

type Props = {
  index: GraphIndex
  stage: ZoomStageKey
  bounds: Bounds
  tagIds: string[]
  /** 표시 중인 해당 동 id (경계 강조) */
  matchedIds: Set<string>
  provinceGroups: ProvinceGroup[]
  onFitBounds: (bounds: Bounds) => void
}

const BOUNDARY: PolygonStyle = {
  fill: 'var(--color-explore-map-boundary)',
  fillOpacity: 0,
  stroke: 'var(--color-explore-map-boundary)',
  strokeWidth: 1,
}
const MATCHED: PolygonStyle = {
  fill: 'var(--color-selected-bg)',
  fillOpacity: 0.06,
  stroke: 'var(--color-selected-bg)',
  strokeWidth: 2,
}
/** 집계 제외 동 (현재 대상 없음). Maps Polygon 은 점선을 못 그려 회색 채움으로 대신한다 */
const EXCLUDED: PolygonStyle = {
  fill: 'var(--color-explore-map-excluded)',
  fillOpacity: 0.6,
  stroke: 'var(--color-explore-map-boundary)',
  strokeWidth: 1,
}

const centerOf = (b: Bounds) => ({ lat: (b.south + b.north) / 2, lng: (b.west + b.east) / 2 })

/** 동 선택 전 바탕 층: 도 라벨·도별 배지, 시군구/행정동 경계와 라벨 */
export default function AreaLayer({
  index,
  stage,
  bounds,
  tagIds,
  matchedIds,
  provinceGroups,
  onFitBounds,
}: Props) {
  const hasTags = tagIds.length > 0
  const sigunguGeo = useSigunguGeoQuery()
  const sggIds = useMemo(
    () => (stage === 'dong' || stage === 'place' ? visibleSigunguIds(index, bounds) : []),
    [stage, index, bounds],
  )
  const dongGeo = useVisibleDongGeo(sggIds)

  const sigunguStyle = useCallback((): PolygonStyle => BOUNDARY, [])
  const sigunguLabel = useCallback(
    (id: string) => (hasTags ? undefined : sigunguAreaLabel(index, id)),
    [hasTags, index],
  )
  const dongStyle = useCallback(
    (id: string): PolygonStyle => {
      if (index.dongById.get(id)?.excluded) return EXCLUDED
      return matchedIds.has(id) ? MATCHED : BOUNDARY
    },
    [index, matchedIds],
  )
  const dongLabel = useCallback(
    (id: string) => {
      const d = index.dongById.get(id)
      if (!d) return undefined
      if (d.excluded) return `${d.name} · ${EXPLORE_COPY.excluded}`
      return hasTags || stage === 'place' ? undefined : dongAreaLabel(d)
    },
    [hasTags, index, stage],
  )

  if (stage === 'province') {
    if (hasTags) {
      return (
        <>
          {provinceGroups.map((g) => (
            <AdvancedMarker
              key={g.provinceId}
              position={index.provinceById.get(g.provinceId)?.center ?? centerOf(g.bounds)}
              onClick={() => onFitBounds(g.bounds)}
            >
              <span className="bg-selected-bg text-selected-fg text-body-sm shadow-float cursor-pointer rounded-full px-3 py-1 font-bold">
                {EXPLORE_COPY.provinceBadge(g.short, g.count)}
              </span>
            </AdvancedMarker>
          ))}
        </>
      )
    }
    return (
      <>
        {index.res.provinces.map((p) =>
          p.center ? (
            <AdvancedMarker key={p.id} position={p.center}>
              <span className="text-heading-lg text-text-secondary">{p.name}</span>
            </AdvancedMarker>
          ) : null,
        )}
      </>
    )
  }

  if (stage === 'sigungu') {
    if (!sigunguGeo.data) return null
    return (
      <PolygonLayer features={sigunguGeo.data} getStyle={sigunguStyle} getLabel={sigunguLabel} />
    )
  }

  return <PolygonLayer features={dongGeo} getStyle={dongStyle} getLabel={dongLabel} />
}
