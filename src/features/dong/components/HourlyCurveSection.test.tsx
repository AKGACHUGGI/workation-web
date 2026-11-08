import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import HourlyCurveSection from '@/features/dong/components/HourlyCurveSection'
import { GEOJIN_2025_10 } from '@/mocks/dong/geojin-2025-10'

describe('HourlyCurveSection', () => {
  it('주중 피크·가장 한산·주말 피크 칸', () => {
    render(
      <HourlyCurveSection
        id="5182025300"
        hourly={GEOJIN_2025_10.hourly}
        peaks={GEOJIN_2025_10.peaks}
        month="2025-10"
        onMonthChange={() => {}}
        animate={false}
      />,
    )
    expect(screen.getByText('주중 피크').nextSibling).toHaveTextContent('11시 · 100')
    expect(screen.getByText('가장 한산').nextSibling).toHaveTextContent('3시 · 48')
    expect(screen.getByText('주말 피크').nextSibling).toHaveTextContent('13시 · 100')
  })
  it('주말 토글 시 가장 한산 칸이 주말 값으로 바뀐다', async () => {
    render(
      <HourlyCurveSection
        id="5182025300"
        hourly={GEOJIN_2025_10.hourly}
        peaks={GEOJIN_2025_10.peaks}
        month="2025-10"
        onMonthChange={() => {}}
        animate={false}
      />,
    )
    await userEvent.click(screen.getByRole('tab', { name: '주말' }))
    expect(screen.getByText('가장 한산').nextSibling).toHaveTextContent('3시 · 47')
  })
  it('월 칩은 ±1개월, 클릭하면 onMonthChange', async () => {
    const onMonthChange = vi.fn()
    render(
      <HourlyCurveSection
        id="5182025300"
        hourly={GEOJIN_2025_10.hourly}
        peaks={GEOJIN_2025_10.peaks}
        month="2025-10"
        onMonthChange={onMonthChange}
        animate={false}
      />,
    )
    expect(screen.getByRole('button', { name: '10월', pressed: true })).toBeInTheDocument()
    await userEvent.click(screen.getByRole('button', { name: '9월' }))
    expect(onMonthChange).toHaveBeenCalledWith('2025-09')
  })
})
