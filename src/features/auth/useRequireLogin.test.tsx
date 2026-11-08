import { describe, expect, it, vi } from 'vitest'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useQuery } from '@tanstack/react-query'
import { authKeys } from '@/features/auth/queryKeys'
import { useRequireLogin } from '@/features/auth/useRequireLogin'
import { UnauthorizedError } from '@/lib/errors'
import { DUI } from '@/mocks/auth/me'
import renderWithAuth from '@/test/renderWithAuth'

function Probe({ action }: { action: () => void }) {
  const requireLogin = useRequireLogin()
  return <button onClick={() => requireLogin(action)}>이 지역 즐겨찾기</button>
}

/** 세션이 만료된 조회 (예: W-08 ['me','favorites','ids']) */
function ExpiredQueryProbe() {
  useQuery({
    queryKey: ['me', 'favorites', 'ids'],
    queryFn: () => Promise.reject(new UnauthorizedError('/api/me/favorites/ids')),
  })
  return null
}

describe('useRequireLogin', () => {
  it('비로그인: action 을 실행하지 않고 로그인 모달을 연다 (스텁 토스트 없음)', async () => {
    const action = vi.fn()
    renderWithAuth(<Probe action={action} />, { me: null })
    await userEvent.click(screen.getByRole('button', { name: '이 지역 즐겨찾기' }))
    expect(action).not.toHaveBeenCalled()
    expect(screen.getByRole('dialog', { name: '당신의 장소를 찾으세요' })).toBeInTheDocument()
    expect(screen.queryByRole('status')).not.toBeInTheDocument()
  })
  it('로그인: 즉시 실행, 모달 없음', async () => {
    const action = vi.fn()
    renderWithAuth(<Probe action={action} />, { me: { ...DUI, needsOnboarding: false } })
    await userEvent.click(screen.getByRole('button', { name: '이 지역 즐겨찾기' }))
    expect(action).toHaveBeenCalledTimes(1)
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })
  it('조회 401 → 세션 만료: me=null, 로그인 모달', async () => {
    const { client } = renderWithAuth(<ExpiredQueryProbe />, {
      me: { ...DUI, needsOnboarding: false },
    })
    expect(
      await screen.findByRole('dialog', { name: '당신의 장소를 찾으세요' }),
    ).toBeInTheDocument()
    expect(client.getQueryData(authKeys.me)).toBeNull()
  })
})
