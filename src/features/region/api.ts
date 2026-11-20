import type { MonthParam } from '@/features/metric/month'
import type { PresetKey } from '@/features/metric/types'
import type {
  NotesResponse,
  NotesSort,
  PollResponse,
  RegionDetailResponse,
} from '@/features/region/types'
import type { CreateNoteRequest, Note, NoteTarget } from '@/features/region/types'
import type {
  HelpfulResponse,
  MonthPhotoTarget,
  RepliesResponse,
  Reply,
} from '@/features/region/types'
import type { MyPhotosResponse } from '@/features/me/types'
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
  const { photos, ...fields } = req
  return api<Note>(`/api/${target.kind}/${target.id}/notes`, {
    method: 'POST',
    body: photos?.length ? toForm(fields, photos) : JSON.stringify(fields),
  })
}

/** 문자열 필드 + photos(같은 이름으로 여러 장) → multipart */
function toForm(fields: Record<string, string | undefined>, photos: File[]): FormData {
  const form = new FormData()
  for (const [k, v] of Object.entries(fields)) if (v !== undefined) form.append(k, v)
  photos.forEach((f) => form.append('photos', f))
  return form
}

/** 내 팁 본문 고치기 → 고친 Note */
export async function updateNote(id: string, body: string): Promise<Note> {
  if (isMock) {
    const { updateNoteMock } = await import('@/mocks/region/tipSocial')
    return mockDelay(updateNoteMock(id, body))
  }
  return api<Note>(`/api/me/tips/${id}`, { method: 'PATCH', body: JSON.stringify({ body }) })
}

/** 도움돼요 누르기(on) · 취소. 여러 번 불러도 결과가 같다 */
export async function setHelpful(id: string, on: boolean): Promise<HelpfulResponse> {
  if (isMock) {
    const { setHelpfulMock } = await import('@/mocks/region/tipSocial')
    return mockDelay(setHelpfulMock(id, on))
  }
  return api<HelpfulResponse>(`/api/tips/${id}/helpful`, { method: on ? 'PUT' : 'DELETE' })
}

export async function fetchReplies(tipId: string): Promise<RepliesResponse> {
  if (isMock) {
    const { getRepliesMock } = await import('@/mocks/region/tipSocial')
    return mockDelay(getRepliesMock(tipId))
  }
  return api<RepliesResponse>(`/api/tips/${tipId}/replies`)
}

export async function createReply(tipId: string, body: string): Promise<Reply> {
  if (isMock) {
    const { createReplyMock } = await import('@/mocks/region/tipSocial')
    return mockDelay(createReplyMock(tipId, body))
  }
  return api<Reply>(`/api/tips/${tipId}/replies`, {
    method: 'POST',
    body: JSON.stringify({ body }),
  })
}

export async function deleteReply(id: string): Promise<void> {
  if (isMock) {
    const { deleteReplyMock } = await import('@/mocks/region/tipSocial')
    return mockDelay(deleteReplyMock(id))
  }
  return api<void>(`/api/me/replies/${id}`, { method: 'DELETE' })
}

/** 이달의 사진 올리기. 올린 사진(내 사진 모양)을 돌려준다 */
export async function uploadMonthPhotos(
  target: MonthPhotoTarget,
  photos: File[],
): Promise<MyPhotosResponse> {
  if (isMock) {
    const { uploadMonthPhotosMock } = await import('@/mocks/region/tipSocial')
    return mockDelay(uploadMonthPhotosMock(target, photos))
  }
  return api<MyPhotosResponse>(`/api/${target.kind}/${target.id}/photos`, {
    method: 'POST',
    body: toForm({ month: target.month }, photos),
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
