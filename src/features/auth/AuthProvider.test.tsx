import { describe, expect, it, vi } from 'vitest'
import { act } from '@testing-library/react'
import { authKeys } from '@/features/auth/queryKeys'
import { DUI } from '@/mocks/auth/me'
import renderWithAuth from '@/test/renderWithAuth'

const listeners = vi.hoisted(() => [] as Array<(event: string) => void>)

vi.mock('@/lib/supabase', () => ({
  supabase: {
    auth: {
      onAuthStateChange: (cb: (event: string) => void) => {
        listeners.push(cb)
        return { data: { subscription: { unsubscribe: vi.fn() } } }
      },
    },
  },
  getAccessToken: vi.fn().mockResolvedValue(null),
}))

describe('AuthProvider × Supabase', () => {
  it('SIGNED_OUT(다른 탭 로그아웃·갱신 실패) → me 를 null 로', () => {
    const { client } = renderWithAuth(<div />, { me: { ...DUI, needsOnboarding: false } })
    act(() => listeners.forEach((cb) => cb('SIGNED_OUT')))
    expect(client.getQueryData(authKeys.me)).toBeNull()
  })
  it('다른 이벤트는 무시', () => {
    const { client } = renderWithAuth(<div />, { me: { ...DUI, needsOnboarding: false } })
    act(() => listeners.forEach((cb) => cb('TOKEN_REFRESHED')))
    expect(client.getQueryData(authKeys.me)).toMatchObject({ id: DUI.id })
  })
})
