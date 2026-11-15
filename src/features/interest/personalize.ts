import { toGrades } from '@/features/metric/score'
import { GRADES } from '@/features/metric/types'
import type { Grade } from '@/features/metric/types'

/**
 * 개인 점수 = base + boost. 등급은 toGrades(개인 점수) 를 기본 등급과 그 한 단계 위 사이로 묶는다.
 * 그래서 관심 없는 지역이 남에게 밀려 기본 등급 아래로 내려가지 않는다 (설계 8절).
 * 점수는 위 등급 항목들의 최솟값 이하로 눌러, 등급 순서(S→C)로 세우면 숫자가 내림차순이 되게 한다.
 */
export function personalize(base: number[], boost: number[]): { score: number; grade: Grade }[] {
  const personal = base.map((b, i) => b + (boost[i] ?? 0))
  const baseG = toGrades(base)
  const persG = toGrades(personal)
  const gradeIdx = personal.map((_, i) => {
    const b = GRADES.indexOf(baseG[i]) // S=0 … C=3
    const p = GRADES.indexOf(persG[i])
    return Math.min(b, Math.max(b - 1, p))
  })
  // 하락 금지·한 단계 상한으로 묶으면 낮은 등급 카드 숫자가 높은 등급 카드보다 커질 수 있다.
  // 그래서 각 점수를 자기보다 높은 등급 항목들의 개인 점수 최솟값 이하로 누른다.
  // 가산점이 0 이상이면 그 최솟값은 항상 자기 기본 점수 이상이라 기본 점수 아래로 내려가지 않는다.
  const minAt = GRADES.map(() => Infinity)
  personal.forEach((score, i) => {
    minAt[gradeIdx[i]] = Math.min(minAt[gradeIdx[i]], score)
  })
  const ceiling = GRADES.map((_, g) => Math.min(Infinity, ...minAt.slice(0, g)))
  return personal.map((score, i) => ({
    score: Math.min(score, ceiling[gradeIdx[i]]),
    grade: GRADES[gradeIdx[i]],
  }))
}
