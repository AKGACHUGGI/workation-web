import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useNavigate } from 'react-router-dom'
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

const GEOJIN = '5182025300'
/** 동 상세 mock 이 있는 같은 시군구 다른 동 */
const OTHER = '5182033000'

/** 같은 페이지 컴포넌트에서 동만 바꾼다 (useDongQuery 가 이전 데이터를 유지해 언마운트되지 않는다) */
function DongSwitch() {
  const navigate = useNavigate()
  return (
    <>
      <button type="button" onClick={() => navigate(`/dongs/${GEOJIN}?month=2025-10`)}>
        거진읍으로
      </button>
      <button type="button" onClick={() => navigate(`/dongs/${OTHER}?month=2025-10`)}>
        다른 동으로
      </button>
      <DongProfilePage />
    </>
  )
}

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
  it('채팅은 본문이 아니라 사이드바 계획 카드 아래', async () => {
    renderWithRouter(<DongProfilePage />, {
      route: '/dongs/5182025300?month=2025-10',
      path: '/dongs/:dongId',
    })
    const ask = await screen.findByRole('heading', { name: '이 동네에 물어보기' })
    const plan = screen.getByRole('complementary')
    const compare = screen.getByRole('link', { name: /다른 동네와 나란히 비교하기/ })
    // 본문 맨 끝(비교 링크)과 계획 카드 모두 채팅보다 앞, 채팅은 계획 카드 안이 아니다
    expect(compare.compareDocumentPosition(ask) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
    expect(plan.compareDocumentPosition(ask) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
    expect(plan.contains(ask)).toBe(false)
  }, 10_000)
  it('동 A → B → A: 채팅 입력이 비고, 돌아온 동의 기록에서 대화가 튀지 않는다', async () => {
    const scrollSpy = vi.fn()
    Element.prototype.scrollIntoView = scrollSpy
    const user = userEvent.setup()
    renderWithRouter(<DongSwitch />, {
      route: `/dongs/${GEOJIN}?month=2025-10`,
      path: '/dongs/:dongId',
    })
    const input = () => screen.getByRole('textbox', { name: '이 동네에 물어보기' })
    const log = () => screen.getByRole('log', { name: '물어본 대화' })
    await screen.findByRole('heading', { name: '이 동네에 물어보기' })
    await user.click(screen.getByRole('button', { name: '이 동네 조용해?' }))
    await waitFor(() => expect(log()).toHaveTextContent('조용함은'))

    await user.click(screen.getByRole('button', { name: '다른 동으로' }))
    const h1 = () => screen.getByRole('heading', { level: 1 })
    await waitFor(() => expect(h1()).not.toHaveTextContent('거진읍'), { timeout: 5000 })
    expect(log()).toBeEmptyDOMElement()
    await user.click(screen.getByRole('button', { name: '이 동네 조용해?' }))
    await waitFor(() => expect(log()).toHaveTextContent('조용함은'))
    await user.type(input(), '입력 중')

    scrollSpy.mockClear()
    await user.click(screen.getByRole('button', { name: '거진읍으로' }))
    await waitFor(() => expect(h1()).toHaveTextContent('거진읍'), { timeout: 5000 })
    expect(input()).toHaveValue('')
    expect(log()).toHaveTextContent('이 동네 조용해?')
    expect(scrollSpy).not.toHaveBeenCalled()
    // @ts-expect-error jsdom 에는 없는 메서드를 테스트에서만 붙였다
    delete Element.prototype.scrollIntoView
  }, 20_000)
})
