import { describe, expect, it, vi } from 'vitest'
import { screen, waitFor, within } from '@testing-library/react'
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
    expect(screen.getByRole('listbox', { name: '연령대' })).toBeInTheDocument()
  })

  it('약관 2개를 체크해도 연령대 전에는 비활성, 휠에서 연령대를 고르면 활성, 닉네임 1자면 에러', async () => {
    renderWithAuth(<div />, { me: DUI })
    const start = screen.getByRole('button', { name: '시작하기' })
    expect(start).toBeDisabled()
    await userEvent.click(screen.getByRole('checkbox', { name: /이용약관/ }))
    expect(start).toBeDisabled()
    await userEvent.click(screen.getByRole('checkbox', { name: /개인정보 처리방침/ }))
    expect(start).toBeDisabled()
    await userEvent.click(screen.getByRole('option', { name: '30대' }))
    expect(start).toBeEnabled()
    await userEvent.clear(screen.getByLabelText('닉네임'))
    await userEvent.type(screen.getByLabelText('닉네임'), '두')
    expect(screen.getByText('닉네임은 2~12자로 입력해 주세요')).toBeInTheDocument()
    expect(start).toBeDisabled()
  })

  it('연령대 listbox 에 10대~90대 9개 선택지가 있다', () => {
    renderWithAuth(<div />, { me: DUI })
    const listbox = screen.getByRole('listbox', { name: '연령대' })
    const options = within(listbox).getAllByRole('option')
    expect(options).toHaveLength(9)
    expect(options[0]).toHaveAccessibleName('10대')
    expect(options[8]).toHaveAccessibleName('90대')
  })

  it('처음에는 선택된 연령대가 없고, 닉네임·약관을 채워도 시작하기가 비활성', async () => {
    renderWithAuth(<div />, { me: DUI })
    const listbox = screen.getByRole('listbox', { name: '연령대' })
    for (const option of within(listbox).getAllByRole('option'))
      expect(option).not.toHaveAttribute('aria-selected', 'true')
    expect(screen.getByLabelText('닉네임')).toHaveValue('두이')
    await userEvent.click(screen.getByRole('checkbox', { name: /이용약관/ }))
    await userEvent.click(screen.getByRole('checkbox', { name: /개인정보 처리방침/ }))
    expect(screen.getByRole('button', { name: '시작하기' })).toBeDisabled()
  })

  it('휠에서 30대를 누르면 선택되고, 제출하면 patchMe(nickname, agreedAt, ageGroup) → 모달 닫힘 + 캐시 갱신', async () => {
    vi.mocked(patchMe).mockResolvedValue({
      ...DUI,
      nickname: '두이',
      ageGroup: '30s',
      needsOnboarding: false,
    })
    const { client } = renderWithAuth(<div />, { me: DUI })
    const option = screen.getByRole('option', { name: '30대' })
    await userEvent.click(option)
    expect(option).toHaveAttribute('aria-selected', 'true')
    await userEvent.click(screen.getByRole('checkbox', { name: /이용약관/ }))
    await userEvent.click(screen.getByRole('checkbox', { name: /개인정보 처리방침/ }))
    await userEvent.click(screen.getByRole('button', { name: '시작하기' }))
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument())
    expect(patchMe).toHaveBeenCalledWith({
      nickname: '두이',
      agreedAt: expect.any(String),
      ageGroup: '30s',
    })
    expect(client.getQueryData(authKeys.me)).toMatchObject({ needsOnboarding: false })
  })

  it('온보딩이 열린 동안 dialog 는 하나뿐이다(휠이 별도 모달로 뜨지 않는다)', async () => {
    renderWithAuth(<div />, { me: DUI })
    expect(screen.getAllByRole('dialog')).toHaveLength(1)
    await userEvent.click(screen.getByRole('option', { name: '30대' }))
    expect(screen.getAllByRole('dialog')).toHaveLength(1)
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
