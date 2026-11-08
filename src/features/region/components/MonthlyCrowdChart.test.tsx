import { describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/react'
import MonthlyCrowdChart from '@/features/region/components/MonthlyCrowdChart'

const months = [53, 41, 41, 46, 60, 60, 80, 100, 52, 68, 52, 47].map((crowd, i) => ({
  month: i + 1,
  crowd,
}))

function setup(onSelectMonth = vi.fn()) {
  const utils = render(
    <MonthlyCrowdChart
      months={months}
      bestMonths={[2, 3]}
      avoidMonths={[7, 8]}
      peerOffpeakMonths={[12, 2]}
      selectedMonth={10}
      onSelectMonth={onSelectMonth}
    />,
  )
  const bars = utils.container.querySelectorAll('.recharts-bar-rectangle')
  return { ...utils, bars, onSelectMonth }
}

describe('MonthlyCrowdChart', () => {
  it('막대 12개', () => {
    expect(setup().bars).toHaveLength(12)
  })
  it('best 는 signal-good, avoid 는 signal-avoid, 나머지는 muted', () => {
    const { bars } = setup()
    const fill = (i: number) => bars[i].querySelector('path')?.getAttribute('fill')
    expect(fill(1)).toBe('var(--color-signal-good)') // 2월
    expect(fill(6)).toBe('var(--color-signal-avoid)') // 7월
    expect(fill(0)).toBe('var(--color-chart-bar-muted)') // 1월
  })
  it('막대 클릭 시 onSelectMonth(월)', () => {
    const { bars, onSelectMonth } = setup()
    fireEvent.click(bars[1].querySelector('path')!)
    expect(onSelectMonth).toHaveBeenCalledWith(2)
  })
  it('우측 3줄', () => {
    setup()
    expect(screen.getByText('2 · 3월')).toBeInTheDocument()
    expect(screen.getByText('7 · 8월')).toBeInTheDocument()
    expect(screen.getByText('12 · 2월')).toBeInTheDocument()
  })
})
