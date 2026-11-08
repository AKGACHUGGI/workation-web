import { api } from '@/lib/api'
import { UnauthorizedError } from '@/lib/errors'
import { isMock, mockDelay } from '@/lib/mock'
import { DUI } from '@/mocks/auth/me'
import { mockSession } from '@/mocks/auth/session'
import type { AuthProvider, Me } from '@/features/auth/types'

/** 200 → Me, 401 → null. 그 외 에러는 던진다(useAuth 가 재시도 1회 후 null 취급) */
export async function fetchMe(): Promise<Me | null> {
  if (isMock) return mockDelay(mockSession.get(), 50)
  try {
    return await api<Me>('/api/auth/me')
  } catch (e) {
    if (e instanceof UnauthorizedError) return null
    throw e
  }
}

export type PatchMeBody = { nickname?: string; agreedAt?: string }

export async function patchMe(body: PatchMeBody): Promise<Me> {
  if (isMock) {
    const cur = mockSession.get()
    if (!cur) throw new UnauthorizedError('/api/auth/me')
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
  return api<Me>('/api/auth/me', { method: 'PATCH', body: JSON.stringify(body) })
}

export async function logout(): Promise<void> {
  if (isMock) {
    mockSession.set(null)
    return mockDelay(undefined, 50)
  }
  await api<void>('/api/auth/logout', { method: 'POST' })
}

export async function deleteMe(): Promise<void> {
  if (isMock) {
    mockSession.set(null)
    return mockDelay(undefined, 50)
  }
  await api<void>('/api/auth/me', { method: 'DELETE' })
}

/** mock 전용. 리다이렉트 없이 세션을 가짜 사용자로 채운다(needsOnboarding=true) */
export async function mockLogin(provider: AuthProvider): Promise<Me> {
  const me: Me = { ...DUI, provider, needsOnboarding: true }
  mockSession.set(me)
  return mockDelay(me, 100)
}
