import { beforeEach, describe, expect, it, vi } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import renderWithRouter from '@/test/renderWithRouter'
import { meSummaryMock } from '@/mocks/me/summary'

const deleteMe = vi.fn().mockResolvedValue(undefined)
const logout = vi.fn().mockResolvedValue(undefined)
// renderWithRouter 안의 W-07 AuthProvider 가 fetchMe 를 부르므로 팩토리에 5개를 모두 넣는다
vi.mock('@/features/auth/api', () => ({
  fetchMe: () => Promise.resolve(null),
  patchMe: vi.fn(),
  logout: () => logout(),
  deleteMe: () => deleteMe(),
  mockLogin: vi.fn(),
}))
const show = vi.fn()
vi.mock('@/components/ui/toast/useToast', () => ({ useToast: () => ({ show }) }))

import AccountSection from '@/features/me/components/AccountSection'

const me = {
  id: 'u1',
  nickname: '두이',
  initial: '두',
  provider: 'kakao' as const,
  emailMasked: 'du***@kakao.com',
  needsOnboarding: false,
  createdAt: '2025-03-14T09:00:00+09:00',
}

describe('AccountSection', () => {
  beforeEach(() => {
    show.mockReset()
    deleteMe.mockReset().mockResolvedValue(undefined)
  })

  it('계정 삭제는 확인 모달을 거친 뒤 API 호출 → 홈으로', async () => {
    renderWithRouter(<AccountSection me={me} summary={meSummaryMock} />, { route: '/me' })
    await userEvent.click(screen.getByRole('button', { name: '계정 삭제' }))
    expect(deleteMe).not.toHaveBeenCalled()
    expect(screen.getByRole('dialog')).toBeInTheDocument()
    await userEvent.click(screen.getByRole('button', { name: '삭제' }))
    await waitFor(() => expect(deleteMe).toHaveBeenCalledTimes(1))
    await waitFor(() => expect(screen.getByTestId('location')).toHaveTextContent(/^\/$/))
  })
  it('계정 삭제 실패 → 토스트, /me 에 머문다', async () => {
    deleteMe.mockRejectedValue(new Error('network'))
    renderWithRouter(<AccountSection me={me} summary={meSummaryMock} />, { route: '/me' })
    await userEvent.click(screen.getByRole('button', { name: '계정 삭제' }))
    await userEvent.click(screen.getByRole('button', { name: '삭제' }))
    await waitFor(() =>
      expect(show).toHaveBeenCalledWith('계정을 삭제하지 못했어요 · 잠시 후 다시 시도해 주세요'),
    )
    expect(screen.getByTestId('location')).toHaveTextContent('/me')
    expect(screen.getByRole('dialog')).toBeInTheDocument()
  })
  it('데이터 요약 줄', () => {
    renderWithRouter(<AccountSection me={me} summary={meSummaryMock} />)
    expect(screen.getByText('즐겨찾기 6 · 팁 7 · 사진 12 · 투표 3')).toBeInTheDocument()
  })
})
