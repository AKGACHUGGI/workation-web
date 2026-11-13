import { useCallback, useMemo } from 'react'
import PolygonLayer from '@/components/map/PolygonLayer'
import { sigunguStyle } from '@/features/explore/mapStyle'
import { DEFAULT_HEAT_METRIC } from '@/features/heatmap/params'
import { useHeatEntries } from '@/features/heatmap/useHeatEntries'
import { useSigunguGeoQuery } from '@/features/heatmap/useSigunguGeoQuery'
import { PRESET_WEIGHTS } from '@/features/metric/constants'
import { DEFAULT_MONTH } from '@/features/metric/month'
import type { Terrain } from '@/features/popular/types'

type Props = {
  activeSgg: string | null
  hovered: string | null
  onPick: (id: string) => void
  onHover: (id: string | null) => void
}

/** 홈(W-01) 기본값과 같은 색 규칙: 기본 달·종합 점수·quiet 프리셋·지형 필터 없음 */
const NO_TERRAIN: Terrain[] = []

/** 12개 시군구 경계 (스펙 §3-1). ⓪ 히트맵 색(로딩 중 회색) + 이름, ① 고른 시군구 테두리 */
export default function SigunguLayer({ activeSgg, hovered, onPick, onHover }: Props) {
  const geo = useSigunguGeoQuery()
  const { entries } = useHeatEntries({
    month: DEFAULT_MONTH,
    scope: 'sigungu',
    sgg: null,
    metric: DEFAULT_HEAT_METRIC,
    weights: PRESET_WEIGHTS.quiet,
    terrain: NO_TERRAIN,
  })
  const stepById = useMemo(() => new Map(entries.map((e) => [e.id, e.step])), [entries])
  const names = useMemo(
    () => new Map((geo.data?.features ?? []).map((f) => [f.properties.id, f.properties.name])),
    [geo.data],
  )

  const getStyle = useCallback(
    (id: string) => sigunguStyle({ id, activeSgg, hovered, step: stepById.get(id) ?? null }),
    [activeSgg, hovered, stepById],
  )
  const getLabel = useCallback(
    (id: string) => (activeSgg ? undefined : names.get(id)),
    [activeSgg, names],
  )

  if (!geo.data) return null
  return (
    <PolygonLayer
      features={geo.data}
      getStyle={getStyle}
      getLabel={getLabel}
      onClick={onPick}
      onHover={onHover}
    />
  )
}
