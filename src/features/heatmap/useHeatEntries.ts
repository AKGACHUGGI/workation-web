import { useMemo } from 'react'
import { useLocation } from 'react-router-dom'
import { colorScale } from '@/features/heatmap/colorScale'
import type { HeatStep } from '@/features/heatmap/colorScale'
import { heatGrades, heatValue } from '@/features/heatmap/heat'
import type { HeatMetric } from '@/features/heatmap/types'
import type { MonthParam } from '@/features/metric/month'
import type { Grade, Weights } from '@/features/metric/types'
import { terrainMatch } from '@/features/popular/sort'
import type { Terrain } from '@/features/popular/types'
import type { TierScope } from '@/features/tier/types'
import { useTierQuery } from '@/features/tier/useTierQuery'
import { carryQuery } from '@/hooks/carryQuery'

export type HeatEntry = {
  id: string
  name: string
  score: number
  grade: Grade
  step: HeatStep
  dimmed: boolean
  href: string
}

type Args = {
  month: MonthParam
  scope: TierScope
  sgg: string | null
  metric: HeatMetric
  weights: Weights
  terrain: Terrain[]
}

/** tier 응답 → 히트맵 항목. 행정동 범위는 선택한 시군구 안의 동만. */
export function useHeatEntries({ month, scope, sgg, metric, weights, terrain }: Args) {
  const query = useTierQuery(month, scope)
  const { search } = useLocation()
  const entries = useMemo<HeatEntry[]>(() => {
    const all = query.data?.items ?? []
    const items = scope === 'dong' ? all.filter((i) => i.sigungu?.id === sgg) : all
    const values = items.map((i) => Math.round(heatValue(i, metric, weights)))
    const grades = heatGrades(values)
    const current = new URLSearchParams(search)
    return items.map((item, i) => ({
      id: item.id,
      name: item.name,
      score: values[i],
      grade: grades[i],
      step: colorScale(values[i]),
      dimmed: scope === 'sigungu' && !terrainMatch(item, terrain),
      href: carryQuery(scope === 'dong' ? `/dongs/${item.id}` : `/regions/${item.id}`, current),
    }))
  }, [query.data, scope, sgg, metric, weights, terrain, search])
  return { entries, isPending: query.isPending, isError: query.isError, refetch: query.refetch }
}
