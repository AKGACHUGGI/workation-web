import { personalize } from '@/features/interest'
import { composite, toGrades } from '@/features/metric/score'
import type { Grade, Weights } from '@/features/metric/types'
import type { HeatMetric } from '@/features/heatmap/types'
import type { TierItem } from '@/features/tier/types'

/** 히트맵 색칠 값. 종합은 composite, 나머지는 scores[metric] */
export function heatValue(item: TierItem, metric: HeatMetric, weights: Weights): number {
  return metric === 'value' ? composite(item.scores, weights) : item.scores[metric]
}

/** 사분위 등급. boosts 가 있으면 관심 가산점을 더한 개인 등급(기본 등급에서 최대 한 단계 위) */
export function heatGrades(values: number[], boosts?: number[]): Grade[] {
  if (!boosts) return toGrades(values)
  return personalize(values, boosts).map((g) => g.grade)
}
