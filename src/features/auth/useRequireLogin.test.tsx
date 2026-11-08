import { describe, expect, it, vi } from 'vitest'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import renderWithRouter from '@/test/renderWithRouter'
import { useRequireLogin } from '@/features/auth/useRequireLogin'

function Probe({ action }: { action: () => void }) {
  const requireLogin = useRequireLogin()
  return <button onClick={() => requireLogin(action)}>이 지역 즐겨찾기</button>
}

describe('useRequireLogin (스텁)', () => {
  it('비로그인: 토스트만 띄우고 action 은 실행하지 않는다', async () => {
    const action = vi.fn()
    renderWithRouter(<Probe action={action} />)
    await userEvent.click(screen.getByRole('button', { name: '이 지역 즐겨찾기' }))
    // renderWithRouter 의 LocationProbe(<output>)도 role=status 라 getByRole('status') 는 2개를 잡는다
    expect(screen.getByText('로그인이 필요합니다')).toBeInTheDocument()
    expect(action).not.toHaveBeenCalled()
  })
})
