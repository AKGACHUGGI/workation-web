import { beforeEach, describe, expect, it, vi } from 'vitest'
import { deleteMe, fetchMe, logout, patchMe, signIn } from '@/features/auth/api'
import { api } from '@/lib/api'
import { UnauthorizedError } from '@/lib/errors'

const auth = vi.hoisted(() => ({
  signInWithOAuth: vi.fn(),
  signOut: vi.fn(),
}))

vi.mock('@/lib/supabase', () => ({ supabase: { auth }, getAccessToken: vi.fn() }))
vi.mock('@/lib/api', () => ({ api: vi.fn() }))
// vitest test.env 가 VITE_USE_MOCK='true' 라 실제 분기를 보려면 끈다
vi.mock('@/lib/mock', () => ({ isMock: false, mockDelay: <T,>(d: T) => Promise.resolve(d) }))

beforeEach(() => {
  vi.mocked(api).mockReset()
  auth.signInWithOAuth.mockReset().mockResolvedValue({ data: {}, error: null })
  auth.signOut.mockReset().mockResolvedValue({ error: null })
})

describe('features/auth/api (Supabase)', () => {
  it('signIn → signInWithOAuth, redirectTo = origin + returnTo', async () => {
    await signIn('kakao', '/regions/51820?month=10&login=1')
    expect(auth.signInWithOAuth).toHaveBeenCalledWith({
      provider: 'kakao',
      options: { redirectTo: `${window.location.origin}/regions/51820?month=10&login=1` },
    })
  })
  it('signIn 실패면 던진다', async () => {
    auth.signInWithOAuth.mockResolvedValue({ data: {}, error: new Error('provider disabled') })
    await expect(signIn('google', '/?login=1')).rejects.toThrow('provider disabled')
  })
  it('logout → signOut, 백엔드 호출 없음', async () => {
    await logout()
    expect(auth.signOut).toHaveBeenCalled()
    expect(api).not.toHaveBeenCalled()
  })
  it('fetchMe → GET /api/me, 401 이면 null', async () => {
    vi.mocked(api).mockRejectedValue(new UnauthorizedError('/api/me'))
    await expect(fetchMe()).resolves.toBeNull()
    expect(api).toHaveBeenCalledWith('/api/me')
  })
  it('patchMe → PATCH /api/me', async () => {
    vi.mocked(api).mockResolvedValue({})
    await patchMe({ nickname: '두이' })
    expect(api).toHaveBeenCalledWith('/api/me', {
      method: 'PATCH',
      body: JSON.stringify({ nickname: '두이' }),
    })
  })
  it('deleteMe → DELETE /api/me 후 로컬 세션 정리', async () => {
    vi.mocked(api).mockResolvedValue(undefined)
    await deleteMe()
    expect(api).toHaveBeenCalledWith('/api/me', { method: 'DELETE' })
    expect(auth.signOut).toHaveBeenCalledWith({ scope: 'local' })
  })
})
