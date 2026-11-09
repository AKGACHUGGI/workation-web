import type { ExploreTag } from '@/features/explore/types'

/** 스펙 §3-0 · §6. 응답 tags 와 같은 순서 */
export const EXPLORE_TAGS: ExploreTag[] = [
  { id: 'coast', label: '바닷가', group: 'trait', display: 'badge' },
  { id: 'city', label: '도심', group: 'trait', display: 'badge' },
  { id: 'cafe', label: '카페 많음', group: 'work', display: 'branch' },
  { id: 'library', label: '도서관', group: 'work', display: 'branch' },
  { id: 'long_stay', label: '장기 숙소', group: 'stay', display: 'branch' },
  { id: 'resort', label: '리조트', group: 'stay', display: 'branch' },
  { id: 'beach', label: '해수욕장', group: 'rest', display: 'branch' },
  { id: 'park', label: '공원', group: 'rest', display: 'branch' },
  { id: 'mountain', label: '산·숲', group: 'rest', display: 'badge' },
  { id: 'island', label: '섬', group: 'rest', display: 'branch' },
  { id: 'surf', label: '서핑', group: 'rest', display: 'branch' },
  { id: 'market', label: '시장', group: 'life', display: 'branch' },
]
