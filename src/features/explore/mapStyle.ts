import type { PolygonStyle } from '@/components/map/geo'
import { HEAT_VAR } from '@/features/heatmap/colorScale'
import type { HeatStep } from '@/features/heatmap/colorScale'

/** ① 행정동 경계: 채움 없이 회색 1px (Figma 점선은 Polygon 이 못 그려 실선) */
export const DONG_BOUNDARY_STYLE: PolygonStyle = {
  fill: 'var(--color-white)',
  fillOpacity: 0,
  stroke: 'var(--color-explore-map-boundary)',
  strokeWidth: 1,
}

/**
 * 시군구 폴리곤 (스펙 §3-1·§9-1). ⓪ 홈 히트맵 색(데이터 전엔 회색), hover 는 진하게 + 브랜드색 테두리
 * (Figma ⓪ 387:8630). ① 고른 시군구는 브랜드색 테두리만(Figma 388:8949), 나머지 시군구는 옅게
 */
export function sigunguStyle({
  id,
  activeSgg,
  hovered,
  step,
}: {
  id: string
  activeSgg: string | null
  hovered: string | null
  step: HeatStep | null
}): PolygonStyle {
  if (id === activeSgg) {
    return {
      fill: 'var(--color-white)',
      fillOpacity: 0,
      stroke: 'var(--color-brand-primary)',
      strokeWidth: 2,
    }
  }
  const isHover = hovered === id
  return {
    fill: step ? `var(${HEAT_VAR[step]})` : 'var(--color-explore-skeleton-map)',
    fillOpacity: activeSgg ? 0.2 : isHover ? 0.85 : 0.65,
    stroke: isHover ? 'var(--color-brand-primary)' : 'var(--color-explore-map-boundary)',
    strokeWidth: isHover ? 2 : 1,
  }
}
