import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { api } from '@/lib/api'
import { NotFoundError, UnauthorizedError } from '@/lib/errors'
import { getAccessToken } from '@/lib/supabase'

vi.mock('@/lib/supabase', () => ({ getAccessToken: vi.fn() }))

beforeEach(() => vi.mocked(getAccessToken).mockResolvedValue(null))

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
  it('JSON 헤더를 보내고 쿠키·CSRF 헤더는 없다', async () => {
    const fetchMock = mockFetch(200, { ok: true })
    await api('/api/me')
    const [, init] = fetchMock.mock.calls[0] as [string, RequestInit]
    expect(init.credentials).toBeUndefined()
    expect(init.headers).toEqual({ 'Content-Type': 'application/json' })
  })
  it('세션이 있으면 Bearer 토큰', async () => {
    vi.mocked(getAccessToken).mockResolvedValue('tok-123')
    const fetchMock = mockFetch(200, {})
    await api('/api/me')
    const [, init] = fetchMock.mock.calls[0] as [string, RequestInit]
    expect(init.headers).toMatchObject({ Authorization: 'Bearer tok-123' })
  })
  it('401 은 UnauthorizedError', async () => {
    mockFetch(401)
    await expect(api('/api/me')).rejects.toBeInstanceOf(UnauthorizedError)
  })
  it('404 는 NotFoundError', async () => {
    mockFetch(404)
    await expect(api('/api/regions/0')).rejects.toBeInstanceOf(NotFoundError)
  })
  it('204 는 undefined', async () => {
    mockFetch(204)
    await expect(api('/api/me', { method: 'DELETE' })).resolves.toBeUndefined()
  })
  it('호출부 헤더는 기본 헤더에 합쳐진다', async () => {
    const fetchMock = mockFetch(200, {})
    await api('/x', { headers: { 'X-Extra': '1' } })
    const [, init] = fetchMock.mock.calls[0] as [string, RequestInit]
    expect(init.headers).toEqual({ 'Content-Type': 'application/json', 'X-Extra': '1' })
  })
})
