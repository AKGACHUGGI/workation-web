import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import MetricCard from '@/components/ui/MetricCard'

describe('MetricCard', () => {
  it('기본: 지표 라벨·정수 점수·등급', () => {
    render(<MetricCard metric="quiet" score={36.6} grade="B" subtitle="낮 유입 0.79" />)
    expect(screen.getByText('동네 조용함')).toBeInTheDocument()
    expect(screen.getByText('37')).toHaveClass('text-number-2xl')
    expect(screen.getByLabelText('등급 B')).toBeInTheDocument()
    expect(screen.getByText('낮 유입 0.79')).toBeInTheDocument()
  })
  it('compact: 작은 숫자 스타일', () => {
    render(<MetricCard metric="vibe" score={38} grade="B" compact />)
    expect(screen.getByText('38')).toHaveClass('text-title-md')
  })
  it('label 로 라벨을 덮어쓴다', () => {
    render(<MetricCard metric="quiet" label="생활권 지수" score={75} grade="A" />)
    expect(screen.getByText('생활권 지수')).toBeInTheDocument()
    expect(screen.queryByText('동네 조용함')).not.toBeInTheDocument()
  })
  it('점수 null 이면 — 와 배지 없음', () => {
    render(<MetricCard metric="quiet" score={null} grade={null} compact />)
    expect(screen.getByText('—')).toBeInTheDocument()
    expect(screen.queryByLabelText(/^등급/)).not.toBeInTheDocument()
  })
})
