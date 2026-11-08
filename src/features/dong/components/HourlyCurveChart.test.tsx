import { describe, expect, it } from 'vitest'
import { render } from '@testing-library/react'
import HourlyCurveChart from '@/features/dong/components/HourlyCurveChart'
import { GEOJIN_2025_10 } from '@/mocks/dong/geojin-2025-10'

function lines(container: HTMLElement) {
  return Array.from(container.querySelectorAll<SVGPathElement>('path.recharts-line-curve'))
}

/** Recharts 3 은 Line 의 name 을 path 속성으로 내보내지 않으므로 className(curve-{day})으로 찾는다 */
function line(container: HTMLElement, day: 'weekday' | 'weekend') {
  return container.querySelector<SVGPathElement>(`.curve-${day} path.recharts-line-curve`)
}

describe('HourlyCurveChart', () => {
  it('24점 선 2개를 그린다', () => {
    const { container } = render(
      <HourlyCurveChart hourly={GEOJIN_2025_10.hourly} day="weekday" width={600} animate={false} />,
    )
    expect(lines(container)).toHaveLength(2)
    expect(container.querySelectorAll('.recharts-line-dot, .recharts-dot')).toHaveLength(0) // 점 없음
  })
  it('선택한 day 선이 굵다', () => {
    const { container, rerender } = render(
      <HourlyCurveChart hourly={GEOJIN_2025_10.hourly} day="weekday" width={600} animate={false} />,
    )
    expect(line(container, 'weekday')).toHaveAttribute('stroke-width', '3')
    expect(line(container, 'weekend')).toHaveAttribute('stroke-width', '1.5')

    rerender(
      <HourlyCurveChart hourly={GEOJIN_2025_10.hourly} day="weekend" width={600} animate={false} />,
    )
    expect(line(container, 'weekend')).toHaveAttribute('stroke-width', '3')
  })
  it('x축 눈금: 전체 폭 3시간 간격 9개, compact 는 0·6·12·18·23', () => {
    const ticks = (c: HTMLElement) =>
      Array.from(c.querySelectorAll('text.recharts-cartesian-axis-tick-value')).map(
        (t) => t.textContent,
      )
    const { container, rerender } = render(
      <HourlyCurveChart hourly={GEOJIN_2025_10.hourly} day="weekday" width={600} animate={false} />,
    )
    expect(ticks(container)).toHaveLength(9)
    rerender(
      <HourlyCurveChart
        hourly={GEOJIN_2025_10.hourly}
        day="weekday"
        width={300}
        compact
        animate={false}
      />,
    )
    expect(ticks(container)).toEqual(['0시', '6시', '12시', '18시', '23시'])
  })
})
