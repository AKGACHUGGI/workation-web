export const HEAT_STEPS = [100, 200, 300, 400, 500, 600, 700] as const
export type HeatStep = (typeof HEAT_STEPS)[number]

/** 0~100 → heat 7단계. 각 단계 폭 ≈ 14.3 */
export function colorScale(score: number): HeatStep {
  const clamped = Math.min(100, Math.max(0, score))
  const idx = Math.min(6, Math.floor((clamped / 100) * 7))
  return HEAT_STEPS[idx]
}

/** Tailwind 클래스 (동적 문자열 조합 금지 → 사전) */
export const HEAT_BG: Record<HeatStep, string> = {
  100: 'bg-heat-100',
  200: 'bg-heat-200',
  300: 'bg-heat-300',
  400: 'bg-heat-400',
  500: 'bg-heat-500',
  600: 'bg-heat-600',
  700: 'bg-heat-700',
}

/** CSS 변수 이름 — 지도 폴리곤 색은 `var(${HEAT_VAR[step]})` 로 넘기면 W-04 PolygonLayer 가 resolveToken 으로 해석 */
export const HEAT_VAR: Record<HeatStep, string> = {
  100: '--color-heat-100',
  200: '--color-heat-200',
  300: '--color-heat-300',
  400: '--color-heat-400',
  500: '--color-heat-500',
  600: '--color-heat-600',
  700: '--color-heat-700',
}
