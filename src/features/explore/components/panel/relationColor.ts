/** ① 노드 색 (Figma 변수와 같은 이름). 시군구 = 본문 글자색(진한 회색), 유형 = v6 유형 색 */
export const NODE_FILL = {
  sigungu: 'var(--color-text-primary)',
  type: 'var(--color-explore-fact-type)',
} as const

/** 범례 유형 색 점 (동적 문자열 조합 금지 → 상수) */
export const TYPE_DOT_BG = 'bg-explore-fact-type'
