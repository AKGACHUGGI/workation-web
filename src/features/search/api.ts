import type { SearchIntent, SearchParseRequest } from '@/features/search/types'
import { api } from '@/lib/api'
import { isMock, mockDelay } from '@/lib/mock'

export async function parseSearch(text: string, signal?: AbortSignal): Promise<SearchIntent> {
  if (isMock) {
    const { getSearchParseMock } = await import('@/mocks/search/parse')
    return mockDelay(getSearchParseMock(text), 300)
  }
  const body: SearchParseRequest = { text }
  return api<SearchIntent>('/api/search/parse', {
    method: 'POST',
    body: JSON.stringify(body),
    signal,
  })
}
