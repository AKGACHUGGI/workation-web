import { api } from '@/lib/api'
import { isMock, mockDelay } from '@/lib/mock'
import type { MonthParam, TierResponse, TierScope } from '@/features/tier/types'

/** GET /api/tier?month={month}&scope={scope}. mock 은 동적 import 로 프로덕션 번들에서 뺀다 */
export async function fetchTier(month: MonthParam, scope: TierScope): Promise<TierResponse> {
  if (isMock) {
    const { getTierMock } = await import('@/mocks/tier')
    return mockDelay(getTierMock(month, scope))
  }
  return api<TierResponse>(`/api/tier?month=${month}&scope=${scope}`)
}
