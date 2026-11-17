import { api } from '@/lib/api'
import { UnauthorizedError } from '@/lib/errors'
import { isMock, mockDelay } from '@/lib/mock'
import { supabase } from '@/lib/supabase'
import { DUI } from '@/mocks/auth/me'
import { mockSession } from '@/mocks/auth/session'
import type { AuthProvider, Me } from '@/features/auth/types'

/** 200 → Me, 401 → null. 그 외 에러는 던진다(useAuth 가 재시도 1회 후 null 취급) */
export async function fetchMe(): Promise<Me | null> {
  if (isMock) return mockDelay(mockSession.get(), 50)
  try {
    return await api<Me>('/api/me')
  } catch (e) {
    if (e instanceof UnauthorizedError) return null
    throw e
  }
}

export type PatchMeBody = { nickname?: string; agreedAt?: string }

export async function patchMe(body: PatchMeBody): Promise<Me> {
  if (isMock) {
    const cur = mockSession.get()
    if (!cur) throw new UnauthorizedError('/api/me')
    const nickname = body.nickname ?? cur.nickname
    const next: Me = {
      ...cur,
      nickname,
      initial: nickname.slice(0, 1),
      needsOnboarding: body.agreedAt ? false : cur.needsOnboarding,
    }
    mockSession.set(next)
    return mockDelay(next, 50)
  }
  return api<Me>('/api/me', { method: 'PATCH', body: JSON.stringify(body) })
}

/** Supabase OAuth 로 이동한다. 돌아올 곳은 returnTo(path+query, login=1 포함) */
export async function signIn(provider: AuthProvider, returnTo: string): Promise<void> {
  if (!supabase)
    throw new Error('Supabase 설정이 없습니다 (VITE_SUPABASE_URL · VITE_SUPABASE_ANON_KEY)')
  const { error } = await supabase.auth.signInWithOAuth({
    provider,
    options: { redirectTo: `${window.location.origin}${returnTo}` },
  })
  if (error) throw error
}

/** Supabase 세션을 끝낸다(refresh token 폐기). 백엔드 호출 없음 */
export async function logout(): Promise<void> {
  if (isMock) {
    mockSession.set(null)
    return mockDelay(undefined, 50)
  }
  if (!supabase) return
  const { error } = await supabase.auth.signOut()
  if (error) throw error
}

/** 계정 삭제. 서버가 Supabase 사용자까지 지우므로 이 브라우저의 세션만 정리한다 */
export async function deleteMe(): Promise<void> {
  if (isMock) {
    mockSession.set(null)
    return mockDelay(undefined, 50)
  }
  await api<void>('/api/me', { method: 'DELETE' })
  await supabase?.auth.signOut({ scope: 'local' })
}

/** mock 전용. 리다이렉트 없이 세션을 가짜 사용자로 채운다(needsOnboarding=true) */
export async function mockLogin(provider: AuthProvider): Promise<Me> {
  const me: Me = { ...DUI, provider, needsOnboarding: true }
  mockSession.set(me)
  return mockDelay(me, 100)
}
