import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import { recordInterest } from '@/features/interest'
import { DONG_ITEMS_2025_10 } from '@/mocks/tier/dong-2025-10'
import renderWithRouter from '@/test/renderWithRouter'
import DongProfilePage from '@/pages/DongProfilePage'

vi.mock('@/features/interest', async (orig) => ({
  ...(await orig<typeof import('@/features/interest')>()),
  recordInterest: vi.fn(),
}))

beforeAll(() => {
  vi.stubEnv('VITE_USE_MOCK', 'true')
  vi.stubEnv('VITE_GOOGLE_MAPS_KEY', '')
})

beforeEach(() => {
  vi.mocked(recordInterest).mockClear()
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

  it('dong profile records view with sigungu', async () => {
    renderWithRouter(<DongProfilePage />, {
      route: '/dongs/5182025300?month=2025-10',
      path: '/dongs/:dongId',
    })
    await waitFor(() => expect(recordInterest).toHaveBeenCalledTimes(1))
    const scores = DONG_ITEMS_2025_10.find((i) => i.id === '5182025300')!.scores
    expect(recordInterest).toHaveBeenCalledWith({
      kind: 'dong_view',
      target: '5182025300',
      payload: {
        sigunguId: '51820',
        snapshot: expect.objectContaining({ month: '2025-10', scores }),
      },
    })
    expect(await screen.findByTestId('quiet-score')).toHaveTextContent('37')
    expect(recordInterest).toHaveBeenCalledTimes(1)
  }, 10_000)
})
