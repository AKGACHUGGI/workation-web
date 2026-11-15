import type { MonthParam } from '@/features/metric/month'
import type { MetricScores, PresetKey, Weights } from '@/features/metric/types'
import type { Terrain } from '@/features/popular/types'

export type InterestKind = 'search' | 'region_view' | 'dong_view'

/** 조회한 순간 화면이 가진 그 지역 값 (설계 8절 스냅숏) */
export type ViewSnapshot = { month: MonthParam; scores: MetricScores; terrain: Terrain[] }

export type SearchPayload = {
  q: string
  preset: PresetKey | null
  terrain: Terrain[]
  month: MonthParam | null
}
export type ViewPayload = { sigunguId: string | null; snapshot: ViewSnapshot | null }

/** 브라우저 기록 한 건. 서버 POST /api/events 본문은 { anonId, kind, target, payload } */
export type InterestEvent =
  | { kind: 'search'; target: null; payload: SearchPayload; at: number }
  | { kind: 'region_view' | 'dong_view'; target: string; payload: ViewPayload; at: number }

/** recordInterest 입력. at 은 기록 함수가 채운다 */
export type InterestInput =
  | { kind: 'search'; target: null; payload: SearchPayload }
  | { kind: 'region_view' | 'dong_view'; target: string; payload: ViewPayload }

export type InterestProfile = {
  metric: Weights // 지표 관심 (감쇠 가중 합)
  terrain: Record<Terrain, number>
  place: Record<string, number> // 시군구 5자리 · 행정동 10자리 코드 → 감쇠 가중 합
  strength: number // 모든 기록의 감쇠 가중 합
}

/** 가산점 계산 대상. TierItem · PopularRegion · FavoriteRegion 을 이 모양으로 넘긴다 */
export type BoostUnit = {
  id: string
  sigunguId?: string
  scores: MetricScores
  terrain?: Terrain[]
}
export type BoostFn = (unit: BoostUnit) => number
