import { afterEach, describe, expect, it, vi } from 'vitest'
import { apiBlob } from '@/lib/api'
import { NotFoundError, UnauthorizedError } from '@/lib/errors'

function mockFetch(status: number) {
  const blob = new Blob(['%PDF'], { type: 'application/pdf' })
  const res = {
    ok: status >= 200 && status < 300,
    status,
    statusText: String(status),
    blob: () => Promise.resolve(blob),
  } as Response
  const fn = vi.fn().mockResolvedValue(res)
  vi.stubGlobal('fetch', fn)
  return { fn, blob }
}

afterEach(() => vi.unstubAllGlobals())

describe('apiBlob', () => {
  it('쿠키 포함 + CSRF 헤더, Content-Type 없음, blob 반환', async () => {
    const { fn, blob } = mockFetch(200)
    await expect(apiBlob('/api/reports/51820/pdf')).resolves.toBe(blob)
    const [, init] = fn.mock.calls[0] as [string, RequestInit]
    expect(init.credentials).toBe('include')
    expect(init.headers).toEqual({ 'X-Requested-With': 'workation-web' })
  })
  it('signal 을 그대로 넘긴다', async () => {
    const { fn } = mockFetch(200)
    const controller = new AbortController()
    await apiBlob('/x', { signal: controller.signal })
    expect((fn.mock.calls[0] as [string, RequestInit])[1].signal).toBe(controller.signal)
  })
  it('401·404·500', async () => {
    mockFetch(401)
    await expect(apiBlob('/x')).rejects.toBeInstanceOf(UnauthorizedError)
    mockFetch(404)
    await expect(apiBlob('/x')).rejects.toBeInstanceOf(NotFoundError)
    mockFetch(500)
    await expect(apiBlob('/x')).rejects.toThrow('API 500')
  })
})
