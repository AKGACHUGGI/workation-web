import { composite, toGrades } from '@/features/metric/score'
import type { Grade, Weights } from '@/features/metric/types'
import type { HeatMetric } from '@/features/heatmap/types'
import type { TierItem } from '@/features/tier/types'

/** 히트맵 색칠 값. 종합은 composite, 나머지는 scores[metric] */
export function heatValue(item: TierItem, metric: HeatMetric, weights: Weights): number {
  return metric === 'value' ? composite(item.scores, weights) : item.scores[metric]
}

export function heatGrades(values: number[]): Grade[] {
  return toGrades(values)
}
