import type { DongDetail, PinsResponse } from '@/features/explore/types'
import { api } from '@/lib/api'
import { NotFoundError } from '@/lib/errors'
import { isMock, mockDelay } from '@/lib/mock'

/** ① 시군구 행정동 핀 (스펙 §6-1). 404 SIGUNGU_NOT_FOUND 는 NotFoundError, 503 은 Error */
export async function fetchPins(sigunguId: string): Promise<PinsResponse> {
  const path = `/api/explore/sigungu/${encodeURIComponent(sigunguId)}/pins`
  if (isMock) {
    const { pinsMock } = await import('@/mocks/explore/pins')
    const res = pinsMock(sigunguId)
    if (!res) throw new NotFoundError(path)
    return mockDelay(res)
  }
  return api<PinsResponse>(path)
}

/** ② 동 상세 (스펙 §6-2). 404 DONG_NOT_FOUND 는 NotFoundError, 503 GRAPH_UNAVAILABLE 은 Error */
export async function fetchDong(dongId: string): Promise<DongDetail> {
  const path = `/api/explore/dongs/${encodeURIComponent(dongId)}`
  if (isMock) {
    const { dongMock } = await import('@/mocks/explore/dong')
    const res = dongMock(dongId)
    if (!res) throw new NotFoundError(path)
    return mockDelay(res)
  }
  return api<DongDetail>(path)
}
