import { describe, expect, it, vi } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { logout, patchMe } from '@/features/auth/api'
import { authKeys } from '@/features/auth/queryKeys'
import { DUI } from '@/mocks/auth/me'
import renderWithAuth from '@/test/renderWithAuth'

vi.mock('@/features/auth/api', () => ({
  fetchMe: vi.fn(),
  patchMe: vi.fn(),
  logout: vi.fn().mockResolvedValue(undefined),
  deleteMe: vi.fn(),
  mockLogin: vi.fn(),
}))

describe('OnboardingModal', () => {
  it('needsOnboarding 이면 바로 열리고, 닉네임 기본값은 제공자 닉네임', () => {
    renderWithAuth(<div />, { me: DUI })
    expect(screen.getByRole('dialog', { name: '거의 다 됐어요' })).toBeInTheDocument()
    expect(screen.getByLabelText('닉네임')).toHaveValue('두이')
  })

  it('약관 2개를 모두 체크하기 전엔 시작하기 비활성, 닉네임 1자면 에러', async () => {
    renderWithAuth(<div />, { me: DUI })
    const start = screen.getByRole('button', { name: '시작하기' })
    expect(start).toBeDisabled()
    await userEvent.click(screen.getByRole('checkbox', { name: /이용약관/ }))
    expect(start).toBeDisabled()
    await userEvent.click(screen.getByRole('checkbox', { name: /개인정보 처리방침/ }))
    expect(start).toBeEnabled()
    await userEvent.clear(screen.getByLabelText('닉네임'))
    await userEvent.type(screen.getByLabelText('닉네임'), '두')
    expect(screen.getByText('닉네임은 2~12자로 입력해 주세요')).toBeInTheDocument()
    expect(start).toBeDisabled()
  })

  it('시작하기 → patchMe(nickname, agreedAt) → 모달 닫힘 + 캐시 갱신', async () => {
    vi.mocked(patchMe).mockResolvedValue({ ...DUI, nickname: '두이', needsOnboarding: false })
    const { client } = renderWithAuth(<div />, { me: DUI })
    await userEvent.click(screen.getByRole('checkbox', { name: /이용약관/ }))
    await userEvent.click(screen.getByRole('checkbox', { name: /개인정보 처리방침/ }))
    await userEvent.click(screen.getByRole('button', { name: '시작하기' }))
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument())
    expect(patchMe).toHaveBeenCalledWith({ nickname: '두이', agreedAt: expect.any(String) })
    expect(client.getQueryData(authKeys.me)).toMatchObject({ needsOnboarding: false })
  })

  it('닫으면 logout + 토스트, me 는 null, 로그인 모달도 다시 열리지 않는다', async () => {
    const { client } = renderWithAuth(<div />, { me: DUI })
    await userEvent.keyboard('{Escape}')
    await waitFor(() => expect(logout).toHaveBeenCalled())
    expect(await screen.findByRole('status')).toHaveTextContent('약관에 동의해야 이용할 수 있어요')
    await waitFor(() => expect(client.getQueryData(authKeys.me)).toBeNull())
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })
})
