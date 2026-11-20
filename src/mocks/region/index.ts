import { monthLabel } from '@/features/metric/month'
import type { MonthParam } from '@/features/metric/month'
import type { PresetKey } from '@/features/metric/types'
import type { NotesResponse, PollResponse, RegionDetailResponse } from '@/features/region/types'
import type { CreateNoteRequest, Note, NoteTarget } from '@/features/region/types'
import { DUI } from '@/mocks/auth/me'
import { region51820_202510 } from '@/mocks/region/51820-2025-10'
import { makeRegionMock } from '@/mocks/region/generate'
import { SIGUNGU_MANUAL } from '@/mocks/region/manual'
import { notes51820 } from '@/mocks/region/notes-51820'
import { poll51820 } from '@/mocks/region/poll-51820'

const HANDWRITTEN: Record<string, RegionDetailResponse> = {
  '51820|2025-10': region51820_202510,
}

/** 없는 id 면 null (api.ts 가 NotFoundError 로 바꾼다) */
export function getRegionMock(id: string, month: MonthParam): RegionDetailResponse | null {
  if (!(id in SIGUNGU_MANUAL)) return null
  return HANDWRITTEN[`${id}|${month}`] ?? makeRegionMock(id, month)
}

export function getNotesMock(id: string): NotesResponse {
  return withCreatedNotes('regions', id, id === '51820' ? notes51820 : { total: 0, items: [] })
}

export function getPollMock(id: string, month: MonthParam, preset: PresetKey): PollResponse {
  const name = SIGUNGU_MANUAL[id]?.name ?? id
  const suffix =
    preset === 'quiet'
      ? '실제로 조용했나요?'
      : preset === 'lively'
        ? '실제로 활기 있었나요?'
        : '어땠나요?'
  const question = `${monthLabel(month)} ${name}, ${suffix}`
  if (id === '51820') return { ...poll51820, question }
  return { question, yes: 0, no: 0, total: 0, photos: [] }
}

/** POST 노트 mock. 메모리에만 쌓인다(새로고침하면 사라짐). 작성자는 mock 사용자 DUI */
const createdNotes = new Map<string, Note[]>()

export function createNoteMock(target: NoteTarget, req: CreateNoteRequest): Note {
  const key = `${target.kind}/${target.id}`
  const note: Note = {
    id: `mock-${Date.now()}`,
    author: { nickname: DUI.nickname, initial: DUI.initial },
    createdAt: new Date().toISOString(),
    body: req.body.trim(),
    helpful: 0,
    replies: 0,
    photos: (req.photos ?? []).map((f, i) => ({ id: `mock-${i}`, url: URL.createObjectURL(f) })),
    mine: true,
    ...(req.visitMonth && { visitMonth: req.visitMonth }),
  }
  createdNotes.set(key, [note, ...(createdNotes.get(key) ?? [])])
  return note
}

/** 이번 세션에서 쓴 노트 (수정 mock 이 고친다) */
export function findCreatedNote(id: string): Note | undefined {
  for (const list of createdNotes.values()) {
    const hit = list.find((n) => n.id === id)
    if (hit) return hit
  }
  return undefined
}

/** GET 노트 mock 에 이번 세션에서 쓴 노트를 맨 앞에 얹는다 (refetch 해도 유지) */
export function withCreatedNotes(
  kind: NoteTarget['kind'],
  id: string,
  res: NotesResponse,
): NotesResponse {
  const mine = createdNotes.get(`${kind}/${id}`) ?? []
  return mine.length
    ? { ...res, total: res.total + mine.length, items: [...mine, ...res.items] }
    : res
}
