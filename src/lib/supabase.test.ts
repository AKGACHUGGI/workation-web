import { describe, expect, it } from 'vitest'
import { getAccessToken, supabase } from '@/lib/supabase'

// vitest.config.ts 의 test.env 가 VITE_USE_MOCK='true' 라 클라이언트를 만들지 않는다
describe('supabase (mock 모드)', () => {
  it('클라이언트 없음', () => {
    expect(supabase).toBeNull()
  })
  it('토큰 없음', async () => {
    await expect(getAccessToken()).resolves.toBeNull()
  })
})
