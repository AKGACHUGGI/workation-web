import { composite, toGrades } from '@/features/metric/score'
import { GRADES, METRIC_KEYS } from '@/features/metric/types'
import type { MetricKey, Weights } from '@/features/metric/types'
import type { TierEntry, TierGroup, TierItem, TierMode } from '@/features/tier/types'

/** 직접 설정: 선택한 지표 1, 나머지 0 */
export function customWeights(selected: readonly MetricKey[]): Weights {
  return Object.fromEntries(METRIC_KEYS.map((k) => [k, selected.includes(k) ? 1 : 0])) as Weights
}

function scoreOf(item: TierItem, mode: TierMode): number {
  return mode.tab === 'value' ? composite(item.scores, mode.weights) : item.scores[mode.metric]
}

function compareEntries(a: TierEntry, b: TierEntry): number {
  return b.score - a.score || a.item.name.localeCompare(b.item.name, 'ko')
}

/** 점수 → 사분위 등급 → S·A·B·C 4개 그룹(빈 그룹 포함) */
export function buildTiers(items: TierItem[], mode: TierMode): TierGroup[] {
  const scores = items.map((item) => scoreOf(item, mode))
  const grades = toGrades(scores)
  const entries: TierEntry[] = items.map((item, i) => ({
    item,
    score: scores[i],
    grade: grades[i],
  }))
  return GRADES.map((grade) => ({
    grade,
    entries: entries.filter((e) => e.grade === grade).sort(compareEntries),
  }))
}

/** 등급 계산 뒤에 시군구로 거른다. 필터는 등급을 바꾸지 않는다 */
export function filterTiers(groups: TierGroup[], sgg: string): TierGroup[] {
  if (sgg === 'all') return groups
  return groups.map((g) => ({ ...g, entries: g.entries.filter((e) => e.item.sigungu?.id === sgg) }))
}
