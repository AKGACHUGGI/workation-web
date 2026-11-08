import type { MonthParam } from '@/features/metric/month'
import type { PopularResponse } from '@/features/popular/types'
import { api } from '@/lib/api'
import { isMock, mockDelay } from '@/lib/mock'

export async function fetchPopular(month: MonthParam): Promise<PopularResponse> {
  if (isMock) {
    const { getPopularMock } = await import('@/mocks/popular')
    return mockDelay(getPopularMock(month))
  }
  return api<PopularResponse>(`/api/regions/popular?month=${month}`)
}
