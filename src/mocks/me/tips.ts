import type { MyTip } from '@/features/me/types'

export const myTipsMock: MyTip[] = [
  {
    id: 'tip-1',
    author: { nickname: '두이', initial: '두' },
    createdAt: '2025-10-20T18:30:00+09:00',
    dongName: '거진읍',
    stayLabel: '2주 체류',
    visitMonth: '2025-10',
    body: '거진항 근처 카페는 평일 오전이 제일 조용해요. 11시 넘으면 관광버스가 들어옵니다.',
    helpful: 12,
    replies: 2,
    target: { kind: 'region', id: '51820', name: '고성군' },
  },
  {
    id: 'tip-2',
    author: { nickname: '두이', initial: '두' },
    createdAt: '2025-08-03T11:00:00+09:00',
    dongName: '교동',
    stayLabel: '한 달 체류',
    visitMonth: '2025-07',
    body: '강릉 교동은 주말 저녁에 도로가 많이 막혀요. 걸어서 다닐 수 있는 숙소를 추천합니다.',
    helpful: 5,
    replies: 0,
    target: { kind: 'region', id: '51150', name: '강릉시' },
  },
]
