// workation-backend 호출용 최소 fetch 래퍼. 백엔드 스택/인증 방식 확정 후 확장합니다.
const BASE_URL = import.meta.env.VITE_API_BASE_URL

export async function api<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { 'Content-Type': 'application/json', ...init?.headers },
    ...init,
  })
  if (!res.ok) throw new Error(`API ${res.status} ${res.statusText}: ${path}`)
  return res.json() as Promise<T>
}
