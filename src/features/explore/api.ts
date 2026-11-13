import type { AskResponse, DongDetail, PinsResponse } from '@/features/explore/types'
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

/** ② 동네에 물어보기 (물어보기 스펙 §5). 400·429·503 은 Error (메시지 `API {status} …`), 404 는 NotFoundError */
export async function askDong(dongId: string, question: string): Promise<AskResponse> {
  const path = `/api/explore/dongs/${encodeURIComponent(dongId)}/ask`
  if (isMock) {
    const { askMock } = await import('@/mocks/explore/ask')
    const res = askMock(dongId, question)
    if (!res) throw new NotFoundError(path)
    return mockDelay(res)
  }
  return api<AskResponse>(path, { method: 'POST', body: JSON.stringify({ question }) })
}
