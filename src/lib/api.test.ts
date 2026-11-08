import { afterEach, describe, expect, it, vi } from 'vitest'
import { api } from '@/lib/api'
import { NotFoundError, UnauthorizedError } from '@/lib/errors'

function mockFetch(status: number, body?: unknown) {
  const res = {
    ok: status >= 200 && status < 300,
    status,
    statusText: String(status),
    json: () => Promise.resolve(body),
  } as Response
  const fn = vi.fn().mockResolvedValue(res)
  vi.stubGlobal('fetch', fn)
  return fn
}

afterEach(() => vi.unstubAllGlobals())

describe('api', () => {
  it('쿠키 포함 + CSRF 헤더를 항상 보낸다', async () => {
    const fetchMock = mockFetch(200, { ok: true })
    await api('/api/auth/me')
    const [, init] = fetchMock.mock.calls[0] as [string, RequestInit]
    expect(init.credentials).toBe('include')
    expect(init.headers).toMatchObject({
      'Content-Type': 'application/json',
      'X-Requested-With': 'workation-web',
    })
  })
  it('401 은 UnauthorizedError', async () => {
    mockFetch(401)
    await expect(api('/api/auth/me')).rejects.toBeInstanceOf(UnauthorizedError)
  })
  it('404 는 NotFoundError', async () => {
    mockFetch(404)
    await expect(api('/api/regions/0')).rejects.toBeInstanceOf(NotFoundError)
  })
  it('204 는 undefined', async () => {
    mockFetch(204)
    await expect(api('/api/auth/logout', { method: 'POST' })).resolves.toBeUndefined()
  })
  it('호출부 헤더는 기본 헤더에 합쳐진다', async () => {
    const fetchMock = mockFetch(200, {})
    await api('/x', { headers: { 'X-Extra': '1' } })
    const [, init] = fetchMock.mock.calls[0] as [string, RequestInit]
    expect(init.headers).toMatchObject({ 'X-Requested-With': 'workation-web', 'X-Extra': '1' })
  })
})
