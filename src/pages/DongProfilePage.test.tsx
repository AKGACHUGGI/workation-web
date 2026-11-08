import { beforeAll, describe, expect, it, vi } from 'vitest'
import { screen } from '@testing-library/react'
import renderWithRouter from '@/test/renderWithRouter'
import DongProfilePage from '@/pages/DongProfilePage'

beforeAll(() => {
  vi.stubEnv('VITE_USE_MOCK', 'true')
  vi.stubEnv('VITE_GOOGLE_MAPS_KEY', '')
})

describe('DongProfilePage', () => {
  it('거진읍 10월: 제목·점수 37·등급 B·주말 관광형 태그·요약 문장', async () => {
    renderWithRouter(<DongProfilePage />, {
      route: '/dongs/5182025300?month=2025-10',
      path: '/dongs/:dongId',
    })
    expect(await screen.findByRole('heading', { level: 1 })).toHaveTextContent('거진읍, 고성군')
    expect(await screen.findByTestId('quiet-score')).toHaveTextContent('37')
    expect(screen.getAllByLabelText('등급 B').length).toBeGreaterThan(0)
    expect(screen.getAllByText('주말 관광형').length).toBeGreaterThan(0)
    expect(
      screen.getAllByText(/주말에 사람이 몰리고 평일 낮 11시가 피크인 생활권 동네/).length,
    ).toBeGreaterThan(0)
    expect(screen.getByText('지도 키가 설정되지 않았습니다')).toBeInTheDocument()
  }, 10_000)
})
