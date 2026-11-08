import { describe, expect, it, vi } from 'vitest'

vi.mock('@/lib/mock', () => ({ isMock: true, mockDelay: <T>(d: T) => Promise.resolve(d) }))

import { fetchTier } from '@/features/tier/api'

describe('fetchTier (mock 모드)', () => {
  it('getTierMock 응답을 돌려준다', async () => {
    const res = await fetchTier('2025-10', 'sigungu')
    expect(res.scope).toBe('sigungu')
    expect(res.items).toHaveLength(12)
  })
})
