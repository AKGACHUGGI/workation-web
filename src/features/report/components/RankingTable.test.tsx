import { describe, expect, it } from 'vitest'
import { screen } from '@testing-library/react'
import renderWithRouter from '@/test/renderWithRouter'
import RankingTable from '@/features/report/components/RankingTable'

const items = [
  { id: '51830', name: '양양군', score: 57 },
  { id: '52110', name: '전주시', score: 56 },
  { id: '51820', name: '고성군', score: 48 },
]

describe('RankingTable', () => {
  it('현재 시군구 행 강조(aria-current), 막대 폭은 점수 %', () => {
    renderWithRouter(<RankingTable items={items} currentId="51820" preset="quiet" />, {
      route: '/reports/51820?preset=quiet',
    })
    const current = screen.getByRole('row', { current: true })
    expect(current).toHaveTextContent('고성군')
    expect(screen.getAllByRole('row')).toHaveLength(3)
    expect(screen.getByTestId('bar-51830')).toHaveStyle({ width: '57%' })
    expect(screen.getByTestId('bar-51820')).toHaveStyle({ width: '48%' })
  })
  it('행 링크는 /reports/{id} 에 preset 을 유지', () => {
    renderWithRouter(<RankingTable items={items} currentId="51820" preset="lively" />, {
      route: '/reports/51820?preset=lively',
    })
    expect(screen.getByRole('link', { name: /양양군/ })).toHaveAttribute(
      'href',
      '/reports/51830?preset=lively',
    )
  })
  it('캡션', () => {
    renderWithRouter(<RankingTable items={items} currentId="51820" preset="quiet" />)
    expect(screen.getByText('종합 점수 · 조용한 곳 프리셋 · 연간')).toBeInTheDocument()
  })
})
