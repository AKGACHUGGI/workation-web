import { describe, expect, it, vi } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import renderWithRouter from '@/test/renderWithRouter'
import SearchSection from '@/features/search/components/SearchSection'

// W-04 가 vitest.config 의 test.env 에 VITE_USE_MOCK='true' 를 넣으므로 isMock 은 true 다.
// 그래도 W-04 보다 먼저 구현될 때(env 없음 → 실제 api 호출)와 mockDelay 를 피하려고 api 모듈을 mock 응답으로 교체한다.
vi.mock('@/features/search/api', () => ({
  parseSearch: async (text: string) => {
    const { getSearchParseMock } = await import('@/mocks/search/parse')
    return getSearchParseMock(text)
  },
}))

describe('SearchSection', () => {
  it('예시 칩 클릭 → 조건 태그 + URL 반영', async () => {
    renderWithRouter(<SearchSection />, { route: '/' })
    await userEvent.click(screen.getByRole('button', { name: /11월에 조용한 해안/ }))
    await waitFor(() => expect(screen.getByText('AI가 이해한 조건')).toBeInTheDocument())
    expect(screen.getByRole('button', { name: '11월 삭제' })).toBeInTheDocument()
    // 태그(setIntent)와 URL(setSearchParams)은 같은 onSuccess 에서 바뀌지만, MemoryRouter 는 위치 변경을
    // startTransition 으로 반영해 부하가 있으면 태그가 먼저 커밋된다. URL 은 따로 기다린다
    await waitFor(() => expect(screen.getByTestId('location')).toHaveTextContent('month=2025-11'))
    expect(screen.getByTestId('location')).toHaveTextContent('preset=quiet')
    expect(screen.getByTestId('location')).toHaveTextContent('terrain=coast')
  })

  it('태그 삭제 → 해당 축 제거, 조건 지우기 → 전부 제거', async () => {
    renderWithRouter(<SearchSection />, { route: '/' })
    await userEvent.click(screen.getByRole('button', { name: /11월에 조용한 해안/ }))
    await userEvent.click(await screen.findByRole('button', { name: '해안 삭제' }))
    expect(screen.getByTestId('location')).not.toHaveTextContent('terrain=')
    await userEvent.click(screen.getByRole('button', { name: '조건 지우기' }))
    expect(screen.getByTestId('location')).toHaveTextContent(/^\/$/)
    expect(screen.queryByText('AI가 이해한 조건')).not.toBeInTheDocument()
  })

  it('결과 0건 안내', async () => {
    renderWithRouter(<SearchSection />, { route: '/' })
    await userEvent.type(screen.getByRole('searchbox'), '아무말{Enter}')
    expect(await screen.findByText(/조건을 찾지 못했어요/)).toBeInTheDocument()
  })
})
