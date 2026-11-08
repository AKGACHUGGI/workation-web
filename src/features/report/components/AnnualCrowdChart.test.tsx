import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import AnnualCrowdChart from '@/features/report/components/AnnualCrowdChart'

const crowd = [53, 41, 41, 46, 60, 60, 80, 100, 52, 68, 52, 47]
const months = crowd.map((c, i) => ({ month: i + 1, crowd: c }))

describe('AnnualCrowdChart', () => {
  it('막대 12개, 상위 3개월(7·8·10)은 brand 색', () => {
    const { container } = render(
      <AnnualCrowdChart months={months} topMonths={[7, 8, 10]} narrative="하반기 상승형입니다." />,
    )
    const bars = container.querySelectorAll('.recharts-bar-rectangle path')
    expect(bars).toHaveLength(12)
    const brand = [...bars].filter((b) => b.getAttribute('fill') === 'var(--color-brand-primary)')
    expect(brand).toHaveLength(3)
    const muted = [...bars].filter((b) => b.getAttribute('fill') === 'var(--color-chart-bar-muted)')
    expect(muted).toHaveLength(9)
  })
  it('제목·범례·문장', () => {
    render(
      <AnnualCrowdChart months={months} topMonths={[7, 8, 10]} narrative="하반기 상승형입니다." />,
    )
    expect(screen.getByRole('heading', { name: '월별 방문인구 지수' })).toBeInTheDocument()
    expect(screen.getByText('방문 지수 · 성수기 상위 3개월')).toBeInTheDocument()
    expect(screen.getByText('하반기 상승형입니다.')).toBeInTheDocument()
  })
})
