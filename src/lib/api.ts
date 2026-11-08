import { NotFoundError, UnauthorizedError } from '@/lib/errors'

/**
 * 개발 서버는 Vite proxy(/api → VITE_API_BASE_URL)로 같은 origin 을 유지해
 * 세션 쿠키(SameSite=Lax)가 붙는다. 빌드 결과는 VITE_API_BASE_URL 을 직접 호출한다.
 */
export const API_BASE_URL: string = import.meta.env.DEV ? '' : import.meta.env.VITE_API_BASE_URL

export async function api<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      // CSRF: 백엔드가 쓰기 요청에서 이 헤더를 요구한다
      'X-Requested-With': 'workation-web',
      ...init?.headers,
    },
  })
  if (res.status === 401) throw new UnauthorizedError(path)
  if (res.status === 404) throw new NotFoundError(path)
  if (!res.ok) throw new Error(`API ${res.status} ${res.statusText}: ${path}`)
  // 본문 없는 응답(로그아웃·탈퇴·즐겨찾기 삭제)은 JSON 을 파싱하지 않는다
  if (res.status === 204) return undefined as T
  return res.json() as Promise<T>
}
