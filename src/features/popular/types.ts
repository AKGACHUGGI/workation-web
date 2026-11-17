import type { MonthParam } from '@/features/metric/month'
import type { MetricScores } from '@/features/metric/types'

export const TERRAINS = ['coast', 'mountain', 'city'] as const
export type Terrain = (typeof TERRAINS)[number]

/** 장소 태그 (백엔드 dong.tags · region.tags 코드, webapi/data.py TAG_KO 순서). 지형 3개는 TERRAINS */
export const PLACE_TAGS = [
  'beach',
  'island',
  'surf',
  'cafe',
  'food',
  'library',
  'park',
  'market',
  'resort',
  'long_stay',
] as const
export type PlaceTag = (typeof PLACE_TAGS)[number]

export const POPULAR_SORTS = ['favorites', 'views', 'score'] as const
export type PopularSort = (typeof POPULAR_SORTS)[number]

/** GET /api/regions/popular?month= 의 항목 (12개 전부, 정렬 없음) */
export type PopularRegion = {
  id: string
  name: string
  province: string
  photoUrl: string
  tags: string[] // Meta1
  terrain: Terrain[] // 수동
  placeTags?: PlaceTag[] // 지형 외 장소 태그. 백엔드가 아직 내려주지 않아 없으면 []
  scores: MetricScores // month 기준 백분위 (tier 와 동일 규칙)
  favoriteCount: number // 누적 즐겨찾기 수 (해제 반영)
  viewCount: number // 최근 30일 W-03 조회수 (백엔드 중복 제거 규칙)
}

export type PopularResponse = { month: MonthParam; asOf: string; items: PopularRegion[] }
