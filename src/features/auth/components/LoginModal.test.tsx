import { describe, expect, it, vi } from 'vitest'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useAuthContext } from '@/features/auth/authContext'
import { assignLocation } from '@/lib/navigation'
import renderWithAuth from '@/test/renderWithAuth'

vi.mock('@/lib/navigation', () => ({ assignLocation: vi.fn() }))
// W-04 이후 vitest.config.ts 의 test.env 가 VITE_USE_MOCK='true' 라 isMock 이 참 → 실제 OAuth 분기를 보려면 끈다
vi.mock('@/lib/mock', () => ({
  isMock: false,
  mockDelay: <T,>(data: T, ms = 200) =>
    new Promise<T>((resolve) => setTimeout(() => resolve(data), ms)),
}))

function Opener({ onDismiss }: { onDismiss?: () => void }) {
  const { openLogin } = useAuthContext()
  return <button onClick={() => openLogin(undefined, { onDismiss })}>열기</button>
}

async function openModal(route = '/regions/51820?month=2025-10', onDismiss?: () => void) {
  renderWithAuth(<Opener onDismiss={onDismiss} />, { me: null, route })
  await userEvent.click(screen.getByRole('button', { name: '열기' }))
  return screen.getByRole('dialog', { name: '당신의 장소를 찾으세요' })
}

describe('LoginModal', () => {
  it('카카오·Google 버튼 2개와 둘러보기 링크', async () => {
    await openModal()
    expect(screen.getByRole('button', { name: '카카오로 시작하기' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Google로 시작하기' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '로그인 없이 둘러보기' })).toBeInTheDocument()
  })

  it('카카오 클릭 → start URL 로 이동 (redirect 에 현재 경로+login=1), 버튼 둘 다 비활성', async () => {
    await openModal()
    await userEvent.click(screen.getByRole('button', { name: '카카오로 시작하기' }))
    expect(assignLocation).toHaveBeenCalledWith(
      '/api/auth/kakao/start?redirect=' +
        encodeURIComponent('/regions/51820?month=2025-10&login=1'),
    )
    expect(screen.getByRole('button', { name: '카카오로 시작하기' })).toBeDisabled()
    expect(screen.getByRole('button', { name: 'Google로 시작하기' })).toBeDisabled()
  })

  it('Esc · 둘러보기 · × 로 닫힌다', async () => {
    const dialog = await openModal()
    await userEvent.keyboard('{Escape}')
    expect(dialog).not.toBeInTheDocument()

    await userEvent.click(screen.getByRole('button', { name: '열기' }))
    await userEvent.click(screen.getByRole('button', { name: '로그인 없이 둘러보기' }))
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()

    await userEvent.click(screen.getByRole('button', { name: '열기' }))
    await userEvent.click(screen.getByRole('button', { name: '닫기' }))
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('열리면 첫 버튼(카카오)에 포커스', async () => {
    await openModal()
    expect(screen.getByRole('button', { name: '카카오로 시작하기' })).toHaveFocus()
  })

  it('포커스 트랩: Tab·Shift+Tab 이 모달 안에서 순환한다', async () => {
    await openModal()
    // 순서: 닫기(×) → 카카오 → Google → 로그인 없이 둘러보기
    await userEvent.tab()
    expect(screen.getByRole('button', { name: 'Google로 시작하기' })).toHaveFocus()
    await userEvent.tab()
    expect(screen.getByRole('button', { name: '로그인 없이 둘러보기' })).toHaveFocus()
    await userEvent.tab() // 마지막 → 처음
    expect(screen.getByRole('button', { name: '닫기' })).toHaveFocus()
    await userEvent.tab({ shift: true }) // 처음 → 마지막
    expect(screen.getByRole('button', { name: '로그인 없이 둘러보기' })).toHaveFocus()
    expect(screen.getByRole('button', { name: '열기' })).not.toHaveFocus()
  })

  it('로그인 없이 닫으면 openLogin 의 onDismiss 를 1회 부른다 (W-08 /me → 홈)', async () => {
    const onDismiss = vi.fn()
    await openModal('/me', onDismiss)
    await userEvent.click(screen.getByRole('button', { name: '로그인 없이 둘러보기' }))
    expect(onDismiss).toHaveBeenCalledTimes(1)
  })
})
