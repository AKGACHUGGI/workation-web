import { beforeEach, describe, expect, it, vi } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useNavigate } from 'react-router-dom'
import { recordInterest } from '@/features/interest'
import { SIGUNGU_ITEMS_2025_10 } from '@/mocks/tier/sigungu-2025-10'
import RegionDetailPage from '@/pages/RegionDetailPage'
import renderWithRouter from '@/test/renderWithRouter'

vi.mock('@/features/interest', async (orig) => ({
  ...(await orig<typeof import('@/features/interest')>()),
  recordInterest: vi.fn(),
}))

/** 같은 지역에서 달만 바꿔 페이지를 다시 그리게 하는 버튼 */
function Harness() {
  const navigate = useNavigate()
  return (
    <>
      <button type="button" onClick={() => navigate('/regions/51820?month=2025-11')}>
        다른 달
      </button>
      <RegionDetailPage />
    </>
  )
}

beforeEach(() => {
  vi.mocked(recordInterest).mockClear()
})

describe('RegionDetailPage 관심 기록', () => {
  it('region detail records view once with snapshot', async () => {
    const user = userEvent.setup()
    renderWithRouter(<Harness />, {
      route: '/regions/51820?month=2025-10',
      path: '/regions/:sggId',
    })
    await waitFor(() => expect(recordInterest).toHaveBeenCalledTimes(1))
    const scores = SIGUNGU_ITEMS_2025_10.find((i) => i.id === '51820')!.scores
    expect(recordInterest).toHaveBeenCalledWith({
      kind: 'region_view',
      target: '51820',
      payload: {
        sigunguId: null,
        snapshot: expect.objectContaining({ month: '2025-10', scores }),
      },
    })

    // 같은 지역을 다시 그려도(달 변경으로 tier 응답이 바뀌어도) 더 부르지 않는다
    await user.click(screen.getByRole('button', { name: '다른 달' }))
    await waitFor(() => expect(screen.getByTestId('location')).toHaveTextContent('month=2025-11'))
    expect(await screen.findByText(/11월 기준/, {}, { timeout: 3000 })).toBeInTheDocument()
    expect(recordInterest).toHaveBeenCalledTimes(1)
  }, 10_000)
})

describe('RegionDetailPage 채팅', () => {
  it('채팅 섹션은 동 목록 앞', async () => {
    renderWithRouter(<RegionDetailPage />, {
      route: '/regions/51820?month=2025-10',
      path: '/regions/:sggId',
    })
    const ask = await screen.findByRole('heading', { name: '고성군에 물어보기' })
    const list = screen.getByRole('heading', { name: /^행정동 \d+곳$/ })
    expect(ask.compareDocumentPosition(list) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
  })
})
