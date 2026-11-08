import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import SummaryCards from '@/features/report/components/SummaryCards'
import { getReportMock } from '@/mocks/report'

/** 숫자와 단위가 다른 크기의 span 으로 나뉘므로 <p> 의 전체 텍스트로 찾는다 */
const valueText = (text: string) => (_: string, el: Element | null) =>
  el?.tagName === 'P' && el.textContent === text

describe('SummaryCards · 고성군', () => {
  const report = getReportMock('51820', 'quiet')!

  it('세 카드 값', () => {
    render(<SummaryCards report={report} />)
    expect(screen.getByText(valueText('35 %'))).toBeInTheDocument()
    expect(screen.getByText(valueText('83 점'))).toBeInTheDocument()
    expect(screen.getByText(valueText('5 위 / 12'))).toBeInTheDocument()
    expect(screen.getByLabelText('등급 S')).toBeInTheDocument()
  })
  it('부제', () => {
    render(<SummaryCards report={report} />)
    expect(screen.getByText(/12곳 평균 30%보다 집중도 높음 \(2위\)/)).toBeInTheDocument()
    expect(screen.getByText(/숙박 계수 0\.98/)).toBeInTheDocument()
    expect(screen.getByText(/조용한 곳 프리셋 연간 순위/)).toBeInTheDocument()
  })
})
