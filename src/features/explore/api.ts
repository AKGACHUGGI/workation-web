import type { ExploreGraphResponse } from '@/features/explore/types'
import { api } from '@/lib/api'
import { isMock, mockDelay } from '@/lib/mock'

/** 진입 시 1회. 503 GRAPH_UNAVAILABLE 은 api() 가 Error 로 던진다 → 오류 화면 (스펙 §9) */
export async function fetchExploreGraph(): Promise<ExploreGraphResponse> {
  if (isMock) {
    const { exploreGraphMock } = await import('@/mocks/explore/graph')
    return mockDelay(exploreGraphMock)
  }
  return api<ExploreGraphResponse>('/api/explore/graph')
}
