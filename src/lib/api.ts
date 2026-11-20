import { NotFoundError, UnauthorizedError } from '@/lib/errors'
import { getAccessToken } from '@/lib/supabase'

/**
 * 개발 서버는 Vite proxy(/api → VITE_API_BASE_URL)로 같은 origin 을 쓴다.
 * 빌드 결과는 VITE_API_BASE_URL 을 직접 호출한다.
 * 로그인 상태면 Supabase access token 을 Authorization: Bearer 로 보낸다(쿠키 없음).
 */
export const API_BASE_URL: string = import.meta.env.DEV ? '' : import.meta.env.VITE_API_BASE_URL

async function authHeader(): Promise<Record<string, string>> {
  const token = await getAccessToken()
  return token ? { Authorization: `Bearer ${token}` } : {}
}

export async function api<T>(path: string, init?: RequestInit): Promise<T> {
  // FormData(사진 업로드)는 브라우저가 boundary 를 넣은 multipart Content-Type 을 직접 붙인다
  const json: Record<string, string> =
    init?.body instanceof FormData ? {} : { 'Content-Type': 'application/json' }
  const res = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers: {
      ...json,
      ...(await authHeader()),
      ...init?.headers,
    },
  })
  if (res.status === 401) throw new UnauthorizedError(path)
  if (res.status === 404) throw new NotFoundError(path)
  if (!res.ok) throw new Error(`API ${res.status} ${res.statusText}: ${path}`)
  // 본문 없는 응답(탈퇴·즐겨찾기 삭제)은 JSON 을 파싱하지 않는다
  if (res.status === 204) return undefined as T
  return res.json() as Promise<T>
}

/**
 * 파일(blob) 응답용. PDF 다운로드처럼 JSON 이 아닌 응답에만 쓴다.
 * 컴포넌트에서 fetch 를 직접 쓰지 않기 위한 유일한 예외 경로. 인증·에러 규칙은 api<T>() 와 같다.
 */
export async function apiBlob(path: string, init?: RequestInit): Promise<Blob> {
  const res = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers: {
      ...(await authHeader()),
      ...init?.headers,
    },
  })
  if (res.status === 401) throw new UnauthorizedError(path)
  if (res.status === 404) throw new NotFoundError(path)
  if (!res.ok) throw new Error(`API ${res.status} ${res.statusText}: ${path}`)
  return res.blob()
}
