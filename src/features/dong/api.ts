import type { DongDetailResponse } from '@/features/dong/types'
import type { MonthParam } from '@/features/metric/month'
import type { NotesResponse, PollResponse } from '@/features/region/types'
import { api } from '@/lib/api'
import { NotFoundError } from '@/lib/errors'
import { isMock, mockDelay } from '@/lib/mock'

export async function fetchDong(id: string, month: MonthParam): Promise<DongDetailResponse> {
  if (isMock) {
    const { getDongMock } = await import('@/mocks/dong')
    const data = getDongMock(id, month)
    if (!data) throw new NotFoundError(`dong ${id}`)
    return mockDelay(data)
  }
  return api<DongDetailResponse>(`/api/dongs/${id}?month=${month}`)
}

export async function fetchDongNotes(
  id: string,
  sort: 'helpful' = 'helpful',
  cursor?: string,
): Promise<NotesResponse> {
  if (isMock) {
    const { getDongNotesMock } = await import('@/mocks/dong')
    return mockDelay(getDongNotesMock(id))
  }
  const qs = new URLSearchParams({ sort })
  if (cursor) qs.set('cursor', cursor)
  return api<NotesResponse>(`/api/dongs/${id}/notes?${qs}`)
}

export async function fetchDongPoll(id: string, month: MonthParam): Promise<PollResponse> {
  if (isMock) {
    const { getDongPollMock } = await import('@/mocks/dong')
    return mockDelay(getDongPollMock(id, month))
  }
  return api<PollResponse>(`/api/dongs/${id}/poll?month=${month}`)
}
