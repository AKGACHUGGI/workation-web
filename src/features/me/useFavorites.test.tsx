import { useRef } from 'react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import renderWithRouter from '@/test/renderWithRouter'

const openLogin = vi.fn()
const show = vi.fn()
let loggedIn = true

vi.mock('@/features/auth/useAuth', () => ({
  useAuth: () => ({ me: loggedIn ? { id: 'u1' } : null, isPending: false, isLoggedIn: loggedIn }),
}))
vi.mock('@/features/auth/useRequireLogin', () => ({
  useRequireLogin: () => (action: () => void) => (loggedIn ? action() : openLogin(action)),
}))
vi.mock('@/components/ui/toast/useToast', () => ({ useToast: () => ({ show }) }))

const putFavorite = vi.fn()
const deleteFavorite = vi.fn()
// 서버 상태. PUT/DELETE 가 바꾸고 onSettled 재조회가 읽는다 (고정값이면 재조회가 낙관적 갱신을 되돌린다)
let server: { regions: string[]; dongs: string[] } = { regions: [], dongs: [] }
vi.mock('@/features/me/api', async () => {
  const actual = await vi.importActual<typeof import('@/features/me/api')>('@/features/me/api')
  return {
    ...actual,
    getFavoriteIds: () =>
      Promise.resolve({ regions: [...server.regions], dongs: [...server.dongs] }),
    putFavorite: (...a: unknown[]) => putFavorite(...a),
    deleteFavorite: (...a: unknown[]) => deleteFavorite(...a),
  }
})

import { FavoriteLimitError } from '@/features/me/api'
import { useFavorites } from '@/features/me/useFavorites'

function Probe() {
  const { isFavorite, toggle } = useFavorites()
  const firstToggle = useRef(toggle) // 첫 렌더의 toggle 고정 — 되돌리기 토스트 onClick 클로저 재현
  return (
    <div>
      <output data-testid="goseong">{String(isFavorite('regions', '51820'))}</output>
      <output data-testid="yangyang">{String(isFavorite('regions', '51830'))}</output>
      <button onClick={() => toggle('regions', '51820')}>toggle goseong</button>
      <button onClick={() => toggle('regions', '51830')}>toggle yangyang</button>
      <button onClick={() => firstToggle.current('regions', '51820')}>stale toggle goseong</button>
    </div>
  )
}

describe('useFavorites', () => {
  beforeEach(() => {
    loggedIn = true
    openLogin.mockReset()
    show.mockReset()
    server = { regions: ['51820'], dongs: [] }
    putFavorite.mockReset().mockImplementation(async (kind: 'regions' | 'dongs', id: string) => {
      server = { ...server, [kind]: [...server[kind], id] }
    })
    deleteFavorite.mockReset().mockImplementation(async (kind: 'regions' | 'dongs', id: string) => {
      server = { ...server, [kind]: server[kind].filter((x) => x !== id) }
    })
  })

  it('비로그인 toggle → 로그인 모달, API 미호출', async () => {
    loggedIn = false
    renderWithRouter(<Probe />)
    await userEvent.click(screen.getByText('toggle yangyang'))
    expect(openLogin).toHaveBeenCalled()
    expect(putFavorite).not.toHaveBeenCalled()
  })

  it('로그인: 서버 ids 를 읽고, toggle 은 낙관적 갱신 + API', async () => {
    renderWithRouter(<Probe />)
    await waitFor(() => expect(screen.getByTestId('goseong')).toHaveTextContent('true'))
    await userEvent.click(screen.getByText('toggle yangyang'))
    // onMutate 는 cancelQueries 를 await 한 뒤 캐시를 바꾸므로 다음 틱에 반영된다
    await waitFor(() => expect(screen.getByTestId('yangyang')).toHaveTextContent('true'))
    expect(putFavorite).toHaveBeenCalledWith('regions', '51830')
    await userEvent.click(screen.getByText('toggle goseong'))
    await waitFor(() => expect(screen.getByTestId('goseong')).toHaveTextContent('false'))
    expect(deleteFavorite).toHaveBeenCalledWith('regions', '51820')
  })

  it('예전 렌더의 toggle 도 최신 캐시 기준 — 해제 후 되돌리기는 PUT', async () => {
    renderWithRouter(<Probe />)
    await waitFor(() => expect(screen.getByTestId('goseong')).toHaveTextContent('true'))
    await userEvent.click(screen.getByText('stale toggle goseong'))
    await waitFor(() => expect(screen.getByTestId('goseong')).toHaveTextContent('false'))
    expect(deleteFavorite).toHaveBeenCalledWith('regions', '51820')
    await userEvent.click(screen.getByText('stale toggle goseong'))
    await waitFor(() => expect(screen.getByTestId('goseong')).toHaveTextContent('true'))
    expect(putFavorite).toHaveBeenCalledWith('regions', '51820')
    expect(deleteFavorite).toHaveBeenCalledTimes(1)
  })

  it('실패하면 롤백', async () => {
    putFavorite.mockRejectedValue(new Error('network'))
    renderWithRouter(<Probe />)
    await waitFor(() => expect(screen.getByTestId('goseong')).toHaveTextContent('true'))
    await userEvent.click(screen.getByText('toggle yangyang'))
    await waitFor(() => expect(screen.getByTestId('yangyang')).toHaveTextContent('false'))
  })

  it('409 면 상한 토스트', async () => {
    putFavorite.mockRejectedValue(new FavoriteLimitError())
    renderWithRouter(<Probe />)
    await waitFor(() => expect(screen.getByTestId('goseong')).toHaveTextContent('true'))
    await userEvent.click(screen.getByText('toggle yangyang'))
    await waitFor(() => expect(show).toHaveBeenCalledWith('최대 50개까지 저장할 수 있어요'))
  })
})
