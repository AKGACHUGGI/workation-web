import type { Grade } from '@/features/metric/types'

/** 등급 글자색 (점수 숫자에도 쓴다) */
export const GRADE_FG: Record<Grade, string> = {
  S: 'text-grade-s-fg',
  A: 'text-grade-a-fg',
  B: 'text-grade-b-fg',
  C: 'text-grade-c-fg',
}

/** 등급 배경색 */
export const GRADE_BG: Record<Grade, string> = {
  S: 'bg-grade-s-bg',
  A: 'bg-grade-a-bg',
  B: 'bg-grade-b-bg',
  C: 'bg-grade-c-bg',
}
