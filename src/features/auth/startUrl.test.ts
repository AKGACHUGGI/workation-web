import { describe, expect, it } from 'vitest'
import { buildReturnTo, startUrl } from '@/features/auth/startUrl'

describe('buildReturnTo', () => {
  it('현재 path+query 에 login=1 을 붙인다', () => {
    expect(buildReturnTo('/regions/51820', '?month=2025-10')).toBe(
      '/regions/51820?month=2025-10&login=1',
    )
  })
  it('쿼리가 없어도 login=1', () => {
    expect(buildReturnTo('/me', '')).toBe('/me?login=1')
  })
  it('이전 login·reason 은 지운다', () => {
    expect(buildReturnTo('/me', '?login=error&reason=denied&tab=tips')).toBe('/me?tab=tips&login=1')
  })
})

describe('startUrl', () => {
  it('제공자 start 경로 + 인코딩된 redirect', () => {
    expect(startUrl('kakao', '/regions/51820?month=2025-10&login=1')).toBe(
      '/api/auth/kakao/start?redirect=%2Fregions%2F51820%3Fmonth%3D2025-10%26login%3D1',
    )
  })
  it('google', () => {
    expect(startUrl('google', '/me?login=1')).toMatch(/^\/api\/auth\/google\/start\?redirect=/)
  })
})
