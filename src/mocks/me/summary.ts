import type { MeSummary } from '@/features/me/types'

export const meSummaryMock = {
  stays: [
    { regionName: '강릉', count: 2 },
    { regionName: '고성', count: 1 },
  ],
  tipCount: 7,
  photoCount: 12,
  favoriteCount: 6,
  voteCount: 3,
  createdAt: '2025-03-14T09:00:00+09:00',
} satisfies MeSummary
