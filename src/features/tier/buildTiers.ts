import { NO_BOOST, personalize } from '@/features/interest'
import type { BoostFn } from '@/features/interest'
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

/** 종합(value)은 관심 가산점을 더한 개인 점수·등급, 지표 하나 보기(metric)는 기본 점수·등급 */
function scoreAndGrade(items: TierItem[], mode: TierMode, boost: BoostFn) {
  const base = items.map((item) => scoreOf(item, mode))
  if (mode.tab === 'metric') {
    const grades = toGrades(base)
    return base.map((score, i) => ({ score, grade: grades[i] }))
  }
  const boosts = items.map((i) =>
    boost({ id: i.id, sigunguId: i.sigungu?.id, scores: i.scores, terrain: i.terrain }),
  )
  return personalize(base, boosts)
}

/** 점수 → 사분위 등급 → S·A·B·C 4개 그룹(빈 그룹 포함). 종합 점수에만 관심 가산점을 더한다 */
export function buildTiers(
  items: TierItem[],
  mode: TierMode,
  boost: BoostFn = NO_BOOST,
): TierGroup[] {
  const scored = scoreAndGrade(items, mode, boost)
  const entries: TierEntry[] = items.map((item, i) => ({ item, ...scored[i] }))
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
