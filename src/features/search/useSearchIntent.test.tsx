import { beforeEach, describe, expect, it, vi } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { recordInterest } from '@/features/interest'
import { useSearchIntent } from '@/features/search/useSearchIntent'
import renderWithRouter from '@/test/renderWithRouter'

vi.mock('@/features/interest', async (orig) => ({
  ...(await orig<typeof import('@/features/interest')>()),
  recordInterest: vi.fn(),
}))

/** 훅 상태를 화면에 드러내는 시험용 컴포넌트 */
function Probe() {
  const search = useSearchIntent()
  return (
    <>
      <button type="button" onClick={() => search.submit('바닷가에서 조용히')}>
        검색
      </button>
      <output data-testid="parsed">{search.noResult || search.intent ? 'done' : ''}</output>
    </>
  )
}

beforeEach(() => {
  vi.mocked(recordInterest).mockClear()
})

describe('useSearchIntent 관심 기록', () => {
  it('submit records search', async () => {
    const user = userEvent.setup()
    renderWithRouter(<Probe />, { route: '/' })
    await user.click(screen.getByRole('button', { name: '검색' }))
    await waitFor(() => expect(screen.getByTestId('parsed')).toHaveTextContent('done'))
    expect(recordInterest).toHaveBeenCalledTimes(1)
    expect(recordInterest).toHaveBeenCalledWith({
      kind: 'search',
      target: null,
      payload: expect.objectContaining({ q: '바닷가에서 조용히' }),
    })
  })

  it('entry parse does not record', async () => {
    renderWithRouter(<Probe />, { route: '/?q=바닷가' })
    // 진입 시 URL q 파싱이 끝날 때까지 기다린다 (목 파서는 모르는 문장에 빈 결과를 준다)
    await waitFor(() => expect(screen.getByTestId('parsed')).toHaveTextContent('done'))
    expect(recordInterest).not.toHaveBeenCalled()
  })
})
