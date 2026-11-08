import { describe, expect, it, vi } from 'vitest'
import { screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import renderWithRouter from '@/test/renderWithRouter'

vi.mock('@/features/tier/api', async () => {
  const { getTierMock } = await import('@/mocks/tier')
  return {
    fetchTier: async (month: '2025-10', scope: 'sigungu' | 'dong') => getTierMock(month, scope),
  }
})

import TierPage from '@/pages/TierPage'

describe('TierPage', () => {
  it('10월 조용한 곳: S 첫 카드 양양군, 설명에 12개 시군구', async () => {
    renderWithRouter(<TierPage />, { route: '/tier?month=2025-10' })
    const s = await screen.findByRole('region', { name: 'S 등급' })
    expect(within(s).getAllByTestId('tier-card')[0]).toHaveTextContent('양양군')
    expect(screen.getByText(/12개 시군구을 S/)).toBeInTheDocument()
  })

  it('활기 있는 한 달로 바꾸면 1위 전주시, URL preset=lively', async () => {
    renderWithRouter(<TierPage />, { route: '/tier?month=2025-10' })
    await screen.findByRole('region', { name: 'S 등급' })
    await userEvent.click(screen.getByRole('button', { name: '활기 있는 한 달' }))
    const s = screen.getByRole('region', { name: 'S 등급' })
    expect(within(s).getAllByTestId('tier-card')[0]).toHaveTextContent('전주시')
    expect(screen.getByTestId('location')).toHaveTextContent('preset=lively')
  })

  it('행정동 범위에 응답에 없는 sgg 는 all 로 고친다', async () => {
    renderWithRouter(<TierPage />, { route: '/tier?month=2025-10&scope=dong&sgg=99999' })
    await screen.findByRole('region', { name: 'S 등급' })
    expect(await screen.findByText(/sgg=all/)).toBeInTheDocument()
  })
})
