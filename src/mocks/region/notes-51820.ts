import type { NotesResponse } from '@/features/region/types'

export const notes51820 = {
  total: 3,
  items: [
    {
      id: 'n1',
      author: { nickname: '두이', initial: '두' },
      createdAt: '2025-10-20T09:00:00+09:00',
      dongName: '거진읍',
      stayLabel: '2주 체류',
      visitMonth: '2025-10',
      body: '거진항 근처 카페는 평일 오전이 비어 있어 일하기 좋았어요. 주말엔 관광객이 늘지만 오후 3시 이후엔 다시 조용해집니다.',
      helpful: 24,
      replies: 3,
    },
    {
      id: 'n2',
      author: { nickname: '바다개발자', initial: '바' },
      createdAt: '2025-10-05T14:30:00+09:00',
      dongName: '토성면',
      stayLabel: '한 달 체류',
      visitMonth: '2025-09',
      body: '송지호 쪽은 9월에도 숙소 잡기 수월했고, 저녁엔 정말 아무 소리도 안 납니다. 차가 없으면 식당 가기가 불편한 점은 감안하세요.',
      helpful: 17,
      replies: 1,
    },
    {
      id: 'n3',
      author: { nickname: '원격근무러', initial: '원' },
      createdAt: '2025-08-12T18:00:00+09:00',
      dongName: '간성읍',
      stayLabel: '1주 체류',
      visitMonth: '2025-08',
      body: '8월 성수기엔 간성읍도 붐빕니다. 군청 근처 도서관은 와이파이가 안정적이라 급할 때 대안으로 괜찮았어요.',
      helpful: 9,
      replies: 0,
    },
  ],
} satisfies NotesResponse
