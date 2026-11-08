import { METRIC_KEYS } from '@/features/metric/types'
import type { Grade, MetricScores, Weights } from '@/features/metric/types'

/** 가중 평균. 가중치 합이 0 이면 0 (호출부가 "지표를 하나 이상 고르세요" 를 보여준다). */
export function composite(scores: MetricScores, weights: Weights): number {
  let sum = 0
  let total = 0
  for (const key of METRIC_KEYS) {
    sum += scores[key] * weights[key]
    total += weights[key]
  }
  return total === 0 ? 0 : sum / total
}

/**
 * 사분위 등급. 값을 내림차순으로 순위 매긴 뒤 순위 비율(rank / n)로
 * ≤ 0.25 S, ≤ 0.5 A, ≤ 0.75 B, 그 외 C. 동점은 같은(더 높은) 순위를 받아 같은 등급.
 * 결과는 입력 순서를 유지한다.
 */
export function toGrades(values: number[]): Grade[] {
  const n = values.length
  if (n === 0) return []
  const sorted = [...values].sort((a, b) => b - a)
  return values.map((v) => {
    const rank = sorted.indexOf(v) + 1 // 동점이면 가장 높은 순위
    const ratio = (rank - 1) / n // 0 ≤ ratio < 1
    if (ratio < 0.25) return 'S'
    if (ratio < 0.5) return 'A'
    if (ratio < 0.75) return 'B'
    return 'C'
  })
}

/** 개별 지표 등급. 점수가 이미 백분위이므로 고정 경계를 쓴다. */
export function metricGrade(score: number): Grade {
  if (score >= 75) return 'S'
  if (score >= 50) return 'A'
  if (score >= 25) return 'B'
  return 'C'
}
