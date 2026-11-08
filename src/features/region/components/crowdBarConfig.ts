/**
 * 월별 막대 BarChart 공유 설정. W-03 MonthlyCrowdChart 와 W-06 AnnualCrowdChart 가 같은 값을 쓴다.
 * 크기를 고정해 ResponsiveContainer 없이 jsdom 에서도 렌더된다.
 */
export const CROWD_BAR = {
  width: 640,
  height: 200,
  barSize: 28,
  radius: [4, 4, 0, 0] as [number, number, number, number],
  margin: { top: 16, right: 8, bottom: 0, left: 8 },
  isAnimationActive: false,
} as const

/** 색은 @theme 토큰의 CSS 변수만 쓴다 (임의 hex 금지) */
export const CROWD_COLORS = {
  good: 'var(--color-signal-good)',
  avoid: 'var(--color-signal-avoid)',
  muted: 'var(--color-chart-bar-muted)',
  brand: 'var(--color-brand-primary)',
  bar: 'var(--color-chart-bar)',
  grid: 'var(--color-chart-grid)',
} as const
