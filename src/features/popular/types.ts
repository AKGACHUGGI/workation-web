import type { MonthParam } from '@/features/metric/month'
import type { MetricScores } from '@/features/metric/types'

export const TERRAINS = ['coast', 'mountain', 'city'] as const
export type Terrain = (typeof TERRAINS)[number]

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
  scores: MetricScores // month 기준 백분위 (tier 와 동일 규칙)
  favoriteCount: number // 누적 즐겨찾기 수 (해제 반영)
  viewCount: number // 최근 30일 W-03 조회수 (백엔드 중복 제거 규칙)
}

export type PopularResponse = { month: MonthParam; asOf: string; items: PopularRegion[] }
