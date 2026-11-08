import { useCallback, useMemo } from 'react'
import { Map as GoogleMap } from '@vis.gl/react-google-maps'
import { useNavigate } from 'react-router-dom'
import PolygonLayer from '@/components/map/PolygonLayer'
import { bboxToBounds, toLatLngPaths } from '@/components/map/geo'
import type { GeoFeatureCollection, PolygonStyle } from '@/components/map/geo'
import { useGeoQuery } from '@/features/dong/useGeoQuery'
import { HEAT_VAR } from '@/features/heatmap/colorScale'
import type { HeatEntry } from '@/features/heatmap/useHeatEntries'
import { useSigunguGeoQuery } from '@/features/heatmap/useSigunguGeoQuery'
import type { TierScope } from '@/features/tier/types'

type Props = {
  scope: TierScope
  sgg: string | null
  /** 행정동 범위인데 시군구를 아직 고르지 않은 상태: 시군구 폴리곤을 회색으로 그리고 클릭하면 onPickSigungu */
  pickMode: boolean
  entries: HeatEntry[]
  hoverId: string | null
  onHover: (id: string | null) => void
  onPickSigungu: (id: string) => void
}

const DIM: PolygonStyle = {
  fill: 'var(--color-gray-300)',
  fillOpacity: 0.35,
  stroke: 'var(--color-gray-500)',
  strokeWidth: 1,
}

/** 폴리곤 전체를 감싸는 [west, south, east, north] */
function bboxOf(fc: GeoFeatureCollection): [number, number, number, number] {
  const pts = fc.features.flatMap((f) => toLatLngPaths(f.geometry).flat())
  const lngs = pts.map((p) => p.lng)
  const lats = pts.map((p) => p.lat)
  return [Math.min(...lngs), Math.min(...lats), Math.max(...lngs), Math.max(...lats)]
}

/**
 * Google Maps 위 폴리곤 히트맵. GoogleMapProvider(W-04) 안에서만 렌더된다.
 * 시군구 범위: sigungu.json 색칠, 클릭 → W-03. 행정동 범위: 고른 시군구의 동 폴리곤, 클릭 → W-04.
 * 색은 토큰 CSS 변수 문자열로 넘기고 PolygonLayer 가 resolveToken 으로 해석한다.
 */
export default function RegionHeatmap({
  scope,
  sgg,
  pickMode,
  entries,
  hoverId,
  onHover,
  onPickSigungu,
}: Props) {
  const navigate = useNavigate()
  const sigunguGeo = useSigunguGeoQuery()
  const dongGeo = useGeoQuery(scope === 'dong' && sgg ? sgg : undefined)
  const byId = useMemo(() => new Map(entries.map((e) => [e.id, e])), [entries])

  const getStyle = useCallback(
    (id: string): PolygonStyle => {
      const e = byId.get(id)
      const hovered = hoverId === id
      if (pickMode || !e || e.dimmed) return { ...DIM, strokeWidth: hovered ? 2 : 1 }
      return {
        fill: `var(${HEAT_VAR[e.step]})`,
        fillOpacity: hovered ? 0.85 : 0.65,
        stroke: 'var(--color-gray-800)',
        strokeWidth: hovered ? 2 : 1,
      }
    },
    [byId, hoverId, pickMode],
  )

  const getLabel = useCallback(
    (id: string) => {
      if (pickMode) return undefined
      const e = byId.get(id)
      return e ? `${e.name} ${e.score}` : undefined
    },
    [byId, pickMode],
  )

  const onClick = useCallback(
    (id: string) => {
      if (pickMode) {
        onPickSigungu(id)
        return
      }
      const e = byId.get(id)
      if (e) navigate(e.href)
    },
    [byId, navigate, onPickSigungu, pickMode],
  )

  const features = scope === 'dong' && !pickMode ? dongGeo.data : sigunguGeo.data
  if (!features || features.features.length === 0) return null

  // hover 툴팁 (스펙 §3-4). PolygonLayer 의 onHover 는 id 만 주므로 커서 위치 대신 지도 왼쪽 위에 고정한다.
  // hoverId 는 카드 hover 와 공유하므로 카드에 올려도 같은 툴팁이 뜬다(연동)
  const hovered = !pickMode && hoverId ? byId.get(hoverId) : undefined

  // PolygonLayer 는 useMap() 을 쓰므로 반드시 <Map> 안에 둔다. 범위(시군구/고른 시군구의 동)가 바뀌면 key 로 다시 맞춘다
  return (
    <div className="relative h-96 w-full overflow-hidden rounded-xl">
      {hovered && (
        <div
          role="tooltip"
          className="border-border-default bg-bg-surface shadow-float text-body-sm text-text-primary pointer-events-none absolute top-3 left-3 z-10 rounded-lg border px-3 py-2"
        >
          {hovered.name} · {hovered.score}점 · {hovered.grade}
        </div>
      )}
      <GoogleMap
        key={pickMode ? 'pick' : `${scope}:${sgg ?? ''}`}
        defaultBounds={bboxToBounds(bboxOf(features))}
        gestureHandling="cooperative"
        disableDefaultUI
        zoomControl
        style={{ width: '100%', height: '100%' }}
      >
        <PolygonLayer
          features={features}
          getStyle={getStyle}
          getLabel={getLabel}
          onHover={onHover}
          onClick={onClick}
        />
      </GoogleMap>
    </div>
  )
}
