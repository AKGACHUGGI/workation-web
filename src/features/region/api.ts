import type { MonthParam } from '@/features/metric/month'
import type { PresetKey } from '@/features/metric/types'
import type {
  NotesResponse,
  NotesSort,
  PollResponse,
  RegionDetailResponse,
} from '@/features/region/types'
import type { CreateNoteRequest, Note, NoteTarget } from '@/features/region/types'
import type { PollChoice, PollTarget, VotePollRequest } from '@/features/region/types'
import { api } from '@/lib/api'
import { NotFoundError } from '@/lib/errors'
import { isMock, mockDelay } from '@/lib/mock'

// mock 은 동적 import — 실서버 빌드에서 src/mocks 가 메인 번들에 들어가지 않게 한다 (W-02·W-04 와 같은 방식)
export async function fetchRegion(id: string, month: MonthParam): Promise<RegionDetailResponse> {
  if (isMock) {
    const { getRegionMock } = await import('@/mocks/region')
    const data = getRegionMock(id, month)
    if (!data) throw new NotFoundError(`/api/regions/${id}`)
    return mockDelay(data)
  }
  return api<RegionDetailResponse>(`/api/regions/${id}?month=${month}`)
}

export async function fetchRegionNotes(
  id: string,
  sort: NotesSort,
  cursor?: string,
): Promise<NotesResponse> {
  if (isMock) {
    const { getNotesMock } = await import('@/mocks/region')
    return mockDelay(getNotesMock(id))
  }
  const qs = new URLSearchParams({ sort })
  if (cursor) qs.set('cursor', cursor)
  return api<NotesResponse>(`/api/regions/${id}/notes?${qs}`)
}

export async function fetchRegionPoll(
  id: string,
  month: MonthParam,
  preset: PresetKey,
): Promise<PollResponse> {
  if (isMock) {
    const { getPollMock } = await import('@/mocks/region')
    return mockDelay(getPollMock(id, month, preset))
  }
  return api<PollResponse>(`/api/regions/${id}/poll?month=${month}&preset=${preset}`)
}

export async function createNote(target: NoteTarget, req: CreateNoteRequest): Promise<Note> {
  if (isMock) {
    const { createNoteMock } = await import('@/mocks/region')
    return mockDelay(createNoteMock(target, req))
  }
  return api<Note>(`/api/${target.kind}/${target.id}/notes`, {
    method: 'POST',
    body: JSON.stringify(req),
  })
}

/** 체감 투표. choice null 이면 취소. 응답은 갱신된 투표 집계(myVote 포함) */
export async function votePoll(
  target: PollTarget,
  choice: PollChoice | null,
): Promise<PollResponse> {
  if (isMock) {
    const { votePollMock } = await import('@/mocks/region/pollVotes')
    return mockDelay(votePollMock(target, choice))
  }
  const req: VotePollRequest = {
    month: target.month,
    ...(target.kind === 'regions' && { preset: target.preset }),
    choice,
  }
  return api<PollResponse>(`/api/${target.kind}/${target.id}/poll/vote`, {
    method: 'POST',
    body: JSON.stringify(req),
  })
}
