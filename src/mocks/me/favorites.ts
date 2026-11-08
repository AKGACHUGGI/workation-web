import type { FavoriteDong, FavoriteRegion } from '@/features/me/types'

export const favoriteRegionsMock: FavoriteRegion[] = [
  {
    id: '51820',
    name: '고성군',
    province: '강원특별자치도',
    photoUrl: '/mock-photos/51820.jpg',
    scores: { quiet: 55, crowd: 37, peer: 48, overnight: 76, vibe: 30 }, // 조용한 곳 50
    tags: ['해안', '속초시 인접'],
    note: '11월 2주 체류 예정',
    visitMonth: '2025-11',
    addedAt: '2025-10-02T10:00:00+09:00',
  },
  {
    id: '51150',
    name: '강릉시',
    province: '강원특별자치도',
    photoUrl: '/mock-photos/51150.jpg',
    scores: { quiet: 12, crowd: 10, peer: 80, overnight: 86, vibe: 25 }, // 조용한 곳 29
    tags: ['해안', '도시'],
    addedAt: '2025-09-20T10:00:00+09:00',
  },
  {
    id: '50130',
    name: '서귀포시',
    province: '제주특별자치도',
    photoUrl: '/mock-photos/50130.jpg',
    scores: { quiet: 76, crowd: 13, peer: 84, overnight: 25, vibe: 80 }, // 조용한 곳 47
    tags: ['해안', '제주 남부'],
    addedAt: '2025-08-11T10:00:00+09:00',
  },
]

export const favoriteDongsMock: FavoriteDong[] = [
  {
    id: '5182025300',
    name: '거진읍',
    kind: 'living',
    sigungu: { id: '51820', name: '고성군' },
    scores: { quiet: 37, crowd: 40, peer: 44, overnight: 76, vibe: 38 },
    addedAt: '2025-10-02T10:05:00+09:00',
  },
  {
    id: '5182033000',
    name: '죽왕면',
    kind: 'tourist',
    sigungu: { id: '51820', name: '고성군' },
    scores: { quiet: 55, crowd: 35, peer: 30, overnight: 76, vibe: 22 },
    addedAt: '2025-10-02T10:06:00+09:00',
  },
  {
    id: '5013061000',
    name: '중문동',
    kind: 'tourist',
    sigungu: { id: '50130', name: '서귀포시' },
    scores: { quiet: 72, crowd: 20, peer: 70, overnight: 25, vibe: 65 },
    addedAt: '2025-08-11T10:10:00+09:00',
  },
]
