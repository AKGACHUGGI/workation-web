import { useMemo } from 'react'
import { useLocation } from 'react-router-dom'
import { colorScale } from '@/features/heatmap/colorScale'
import type { HeatStep } from '@/features/heatmap/colorScale'
import { heatGrades, heatValue } from '@/features/heatmap/heat'
import { useBoost } from '@/features/interest'
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
  const boost = useBoost()
  const entries = useMemo<HeatEntry[]>(() => {
    const all = query.data?.items ?? []
    const items = scope === 'dong' ? all.filter((i) => i.sigungu?.id === sgg) : all
    const raw = items.map((i) => heatValue(i, metric, weights))
    // 관심 가산점은 종합에만. 지표 하나 보기는 기본 점수·등급 그대로
    const boosts =
      metric === 'value'
        ? items.map((i) =>
            boost({ id: i.id, sigunguId: i.sigungu?.id, scores: i.scores, terrain: i.terrain }),
          )
        : undefined
    // 등급 입력은 기존처럼 반올림한 기본 점수 (기록이 없을 때 등급이 지금과 같게).
    // 보이는 점수·색은 티어·상세처럼 반올림 전 기본 점수 + 가산점을 마지막에 한 번만 반올림한다
    const grades = heatGrades(
      raw.map((v) => Math.round(v)),
      boosts,
    )
    const shown = raw.map((v, i) => Math.round(v + (boosts?.[i] ?? 0)))
    const current = new URLSearchParams(search)
    return items.map((item, i) => ({
      id: item.id,
      name: item.name,
      score: shown[i],
      grade: grades[i],
      step: colorScale(shown[i]),
      dimmed: scope === 'sigungu' && !terrainMatch(item, terrain),
      href: carryQuery(scope === 'dong' ? `/dongs/${item.id}` : `/regions/${item.id}`, current),
    }))
  }, [query.data, scope, sgg, metric, weights, terrain, search, boost])
  return { entries, isPending: query.isPending, isError: query.isError, refetch: query.refetch }
}
