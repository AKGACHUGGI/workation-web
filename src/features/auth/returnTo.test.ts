import { describe, expect, it } from 'vitest'
import { buildReturnTo } from '@/features/auth/returnTo'

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
