import { describe, expect, it, vi } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import { fetchMe } from '@/features/auth/api'
import { DUI } from '@/mocks/auth/me'
import renderWithAuth from '@/test/renderWithAuth'

vi.mock('@/features/auth/api', () => ({
  fetchMe: vi.fn(),
  patchMe: vi.fn(),
  logout: vi.fn(),
  deleteMe: vi.fn(),
  mockLogin: vi.fn(),
}))

describe('useLoginReturn (AuthProvider 안의 LoginReturnWatcher)', () => {
  it('login=1 → me 재검증, 쿼리 제거(replace), 토스트', async () => {
    vi.mocked(fetchMe).mockResolvedValue({ ...DUI, needsOnboarding: false })
    renderWithAuth(<div />, { me: null, route: '/me?tab=tips&login=1' })
    // 시드된 me(null)를 invalidate → 활성 쿼리라 fetchMe 가 다시 불린다
    await waitFor(() => expect(fetchMe).toHaveBeenCalled())
    await waitFor(() =>
      expect(screen.getByTestId('location')).toHaveTextContent(/^\/me\?tab=tips$/),
    )
    expect(await screen.findByRole('status')).toHaveTextContent('로그인했습니다')
  })

  it('login=error → 실패 토스트 + 모달 다시 열기 + 쿼리 제거', async () => {
    renderWithAuth(<div />, { me: null, route: '/regions/51820?login=error&reason=denied' })
    expect(await screen.findByRole('status')).toHaveTextContent(
      '로그인에 실패했습니다. 다시 시도해 주세요',
    )
    expect(screen.getByRole('dialog', { name: '당신의 장소를 찾으세요' })).toBeInTheDocument()
    expect(screen.getByTestId('location')).toHaveTextContent('/regions/51820')
    expect(screen.getByTestId('location')).not.toHaveTextContent('login=')
  })
})
