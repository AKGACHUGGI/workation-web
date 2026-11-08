import type { MonthParam } from '@/features/metric/month'
import type { NotesResponse, PollResponse } from '@/features/region/types'
import { makeDongMock } from '@/mocks/dong/makeDongMock'
import { DONG_MANUAL } from '@/mocks/dong/manual'

export function getDongMock(id: string, month: MonthParam) {
  if (!(id in DONG_MANUAL)) return undefined
  return makeDongMock(id, month)
}

/** 거진읍만 샘플 노트, 나머지는 빈 목록 */
export function getDongNotesMock(id: string): NotesResponse {
  if (id !== '5182025300') return { total: 0, items: [] }
  return {
    total: 2,
    items: [
      {
        id: 'dn1',
        author: { nickname: '두이', initial: '두' },
        createdAt: '2025-10-14T09:00:00Z',
        dongName: '거진읍',
        stayLabel: '2주 체류',
        visitMonth: '2025-10',
        body: '오전엔 항구 쪽 카페가 한산해서 일하기 좋았어요. 주말 낮엔 화진포 쪽으로 사람이 몰립니다.',
        helpful: 12,
        replies: 1,
      },
      {
        id: 'dn2',
        author: { nickname: '바다', initial: '바' },
        createdAt: '2025-09-30T12:00:00Z',
        dongName: '거진읍',
        stayLabel: '1주 체류',
        visitMonth: '2025-09',
        body: '저녁 8시 넘으면 거의 조용합니다. 야식은 속초로 나가야 해요.',
        helpful: 7,
        replies: 0,
      },
    ],
  }
}

export function getDongPollMock(id: string, month: MonthParam): PollResponse {
  const base = id === '5182025300' ? { yes: 41, no: 9 } : { yes: 0, no: 0 }
  return {
    question: '', // 화면은 pollQuestion() 으로 만든다
    yes: base.yes,
    no: base.no,
    total: base.yes + base.no,
    photos:
      id === '5182025300' && month !== 'annual'
        ? [{ url: '/mock-photos/51820.jpg', author: '두이' }]
        : [],
  }
}
