import type { ChatRequest, ChatResponse } from '@/features/chat/types'
import { api } from '@/lib/api'
import { NotFoundError } from '@/lib/errors'
import { isMock, mockDelay } from '@/lib/mock'

/**
 * 상세 페이지 채팅 (탐색 채팅 백엔드 스펙 §8 · 시군구 채팅 스펙 §3).
 * 400·429·503 은 Error (메시지 `API {status} …`), 404 는 NotFoundError
 */
export async function postChat(body: ChatRequest): Promise<ChatResponse> {
  const path = '/api/explore/chat'
  if (isMock) {
    const { chatMock } = await import('@/mocks/explore/chat')
    const res = chatMock(body)
    if (!res) throw new NotFoundError(path)
    return mockDelay(res)
  }
  return api<ChatResponse>(path, { method: 'POST', body: JSON.stringify(body) })
}
