import type { PollResponse } from '@/features/region/types'

export const poll51820 = {
  question: '10월 고성군, 실제로 조용했나요?',
  yes: 28,
  no: 13,
  total: 41,
  photos: [
    { url: '/mock-photos/51820-1.jpg', author: '두이' },
    { url: '/mock-photos/51820-2.jpg', author: '바다개발자' },
    { url: '/mock-photos/51820-3.jpg', author: '원격근무러' },
  ],
} satisfies PollResponse
