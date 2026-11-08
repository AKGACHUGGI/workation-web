import { NotFoundError } from '@/lib/errors'

/**
 * public/ 아래 정적 자산(JSON)을 읽는다. 백엔드 API 가 아니므로 api<T>() 를 쓰지 않는 유일한 예외.
 * 404 는 NotFoundError 로 던져 호출부가 빈 값으로 대체할 수 있게 한다.
 */
export async function loadStaticJson<T>(path: string): Promise<T> {
  const res = await fetch(path, { headers: { Accept: 'application/json' } })
  if (res.status === 404) throw new NotFoundError(path)
  if (!res.ok) throw new Error(`static ${res.status}: ${path}`)
  return res.json() as Promise<T>
}
