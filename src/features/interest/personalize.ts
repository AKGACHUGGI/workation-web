import { toGrades } from '@/features/metric/score'
import { GRADES } from '@/features/metric/types'
import type { Grade } from '@/features/metric/types'

/**
 * 개인 점수 = base + boost. 등급은 toGrades(개인 점수) 를 기본 등급과 그 한 단계 위 사이로 묶는다.
 * 그래서 관심 없는 지역이 남에게 밀려 기본 등급 아래로 내려가지 않는다 (설계 8절).
 */
export function personalize(base: number[], boost: number[]): { score: number; grade: Grade }[] {
  const personal = base.map((b, i) => b + (boost[i] ?? 0))
  const baseG = toGrades(base)
  const persG = toGrades(personal)
  return personal.map((score, i) => {
    const b = GRADES.indexOf(baseG[i]) // S=0 … C=3
    const p = GRADES.indexOf(persG[i])
    return { score, grade: GRADES[Math.min(b, Math.max(b - 1, p))] }
  })
}
