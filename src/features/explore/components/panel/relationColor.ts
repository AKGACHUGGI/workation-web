import type { RelationKey } from '@/features/explore/sigunguGraph'

/** 사실 노드 색 (스펙 §3-2 표, Figma 변수와 같은 이름). 조용함·저녁 활기는 같은 회색 */
export const RELATION_FILL: Record<RelationKey, string> = {
  type: 'var(--color-explore-fact-type)',
  coast: 'var(--color-explore-fact-coast)',
  life: 'var(--color-explore-fact-life)',
  quiet: 'var(--color-explore-fact-grade)',
  evening: 'var(--color-explore-fact-grade)',
}

/** 칩·범례의 색 점 (동적 문자열 조합 금지 → 사전) */
export const RELATION_BG: Record<RelationKey, string> = {
  type: 'bg-explore-fact-type',
  coast: 'bg-explore-fact-coast',
  life: 'bg-explore-fact-life',
  quiet: 'bg-explore-fact-grade',
  evening: 'bg-explore-fact-grade',
}
