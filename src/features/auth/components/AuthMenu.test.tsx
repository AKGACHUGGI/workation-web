import { describe, expect, it, vi } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import AuthMenu from '@/features/auth/components/AuthMenu'
import { logout } from '@/features/auth/api'
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

const loggedIn = { ...DUI, needsOnboarding: false }

describe('AuthMenu', () => {
  it('비로그인: 로그인 버튼 → 모달', async () => {
    renderWithAuth(<AuthMenu />, { me: null })
    await userEvent.click(screen.getByRole('button', { name: '로그인' }))
    expect(screen.getByRole('dialog', { name: '당신의 장소를 찾으세요' })).toBeInTheDocument()
  })

  it('로그인: 아바타 "두" → 메뉴(마이페이지 /me · 로그아웃)', async () => {
    renderWithAuth(<AuthMenu />, { me: loggedIn })
    const avatar = screen.getByRole('button', { name: '두이 메뉴' })
    expect(avatar).toHaveTextContent('두')
    expect(avatar).toHaveAttribute('aria-expanded', 'false')
    await userEvent.click(avatar)
    expect(avatar).toHaveAttribute('aria-expanded', 'true')
    expect(screen.getByRole('menuitem', { name: '마이페이지' })).toHaveAttribute('href', '/me')
    expect(screen.getByRole('menuitem', { name: '로그아웃' })).toBeInTheDocument()
  })

  it('로그아웃 → api.logout, me=null, / 로 이동, 토스트', async () => {
    const { client } = renderWithAuth(<AuthMenu />, { me: loggedIn, route: '/me' })
    await userEvent.click(screen.getByRole('button', { name: '두이 메뉴' }))
    await userEvent.click(screen.getByRole('menuitem', { name: '로그아웃' }))
    await waitFor(() => expect(logout).toHaveBeenCalled())
    await waitFor(() => expect(client.getQueryData(authKeys.me)).toBeNull())
    expect(await screen.findByRole('button', { name: '로그인' })).toBeInTheDocument()
    expect(screen.getByTestId('location')).toHaveTextContent(/^\/$/)
    expect(screen.getByRole('status')).toHaveTextContent('로그아웃했습니다')
  })

  it('Esc 로 메뉴가 닫힌다', async () => {
    renderWithAuth(<AuthMenu />, { me: loggedIn })
    await userEvent.click(screen.getByRole('button', { name: '두이 메뉴' }))
    await userEvent.keyboard('{Escape}')
    expect(screen.queryByRole('menu')).not.toBeInTheDocument()
  })
})
