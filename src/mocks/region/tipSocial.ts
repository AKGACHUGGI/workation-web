import type { MyPhotosResponse } from '@/features/me/types'
import type {
  HelpfulResponse,
  MonthPhotoTarget,
  Note,
  RepliesResponse,
  Reply,
} from '@/features/region/types'
import { DUI } from '@/mocks/auth/me'
import { findCreatedNote } from '@/mocks/region'

/**
 * 노트 수정 · 도움돼요 · 답글 · 이달의 사진 mock. 이번 세션 메모리에만 남는다.
 * 집계는 응답으로 채운 쿼리 캐시에만 반영된다 (GET mock 은 모른다)
 */
const replies = new Map<string, Reply[]>()
const helped = new Set<string>()

export function updateNoteMock(id: string, body: string): Note {
  const note = findCreatedNote(id)
  if (!note) throw new Error(`mock: 내 팁이 아님 ${id}`)
  note.body = body.trim()
  return { ...note }
}

export function setHelpfulMock(id: string, on: boolean): HelpfulResponse {
  if (on) helped.add(id)
  else helped.delete(id)
  return { helpful: on ? 1 : 0, myHelpful: on }
}

export function getRepliesMock(tipId: string): RepliesResponse {
  return { items: [...(replies.get(tipId) ?? [])] }
}

export function createReplyMock(tipId: string, body: string): Reply {
  const reply: Reply = {
    id: `mock-reply-${Date.now()}`,
    author: { nickname: DUI.nickname, initial: DUI.initial },
    createdAt: new Date().toISOString(),
    body: body.trim(),
    mine: true,
  }
  replies.set(tipId, [...(replies.get(tipId) ?? []), reply])
  return reply
}

export function deleteReplyMock(id: string): void {
  for (const [tipId, list] of replies)
    replies.set(
      tipId,
      list.filter((r) => r.id !== id),
    )
}

export function uploadMonthPhotosMock(target: MonthPhotoTarget, photos: File[]): MyPhotosResponse {
  return {
    items: photos.map((f, i) => ({
      id: `mock-photo-${Date.now()}-${i}`,
      url: URL.createObjectURL(f),
      month: target.month,
      regionName: target.id,
      status: 'approved' as const,
    })),
  }
}
