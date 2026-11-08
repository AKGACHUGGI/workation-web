import { API_BASE_URL } from '@/lib/api'
import type { AuthProvider } from '@/features/auth/types'

/** 로그인 후 돌아올 곳. path+query 만 (origin 없음 — 백엔드가 같은 origin 만 허용). login=1 로 복귀를 표시 */
export function buildReturnTo(pathname: string, search: string): string {
  const params = new URLSearchParams(search)
  params.delete('login')
  params.delete('reason')
  params.set('login', '1')
  return `${pathname}?${params.toString()}`
}

/** 백엔드 OAuth 시작 URL. 앱 키는 프론트에 없다 */
export function startUrl(provider: AuthProvider, returnTo: string): string {
  return `${API_BASE_URL}/api/auth/${provider}/start?redirect=${encodeURIComponent(returnTo)}`
}
