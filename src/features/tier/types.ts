import type { MonthParam } from '@/features/metric/month'
import type { Grade, MetricKey, MetricScores, Weights } from '@/features/metric/types'

export type { MonthParam } from '@/features/metric/month'

export type TierScope = 'sigungu' | 'dong'
export type TierTab = 'value' | 'metric'
export type Terrain = 'coast' | 'mountain' | 'city'

/** GET /api/tier?month={month}&scope={scope} — 백엔드 계약 */
export type TierResponse = {
  month: MonthParam
  scope: TierScope
  items: TierItem[]
}

export type TierItem = {
  id: string // 시군구코드(5자리) 또는 행정동코드(10자리)
  name: string // "양양군" / "거진읍"
  province: string // "강원특별자치도"
  sigungu?: { id: string; name: string } // scope=dong 일 때 필수
  photoUrl: string
  scores: MetricScores // 0~100 정수, 같은 month·scope 안의 백분위
  inherited: MetricKey[] // 상위 단위 값을 물려받은 지표. dong → ['overnight'], sigungu → []
  terrain: Terrain[] // 지형(수동 관리). 행정동은 소속 시군구 값. W-01 지형 필터가 쓴다
}

/** 등급 계산 기준. selected 는 직접 설정에서 고르지 않은 지표를 흐리게 표시할 때만 쓴다 */
export type TierMode =
  { tab: 'value'; weights: Weights; selected?: MetricKey[] } | { tab: 'metric'; metric: MetricKey }

/** score 는 반올림 전 값. 화면 표시는 Math.round */
export type TierEntry = { item: TierItem; score: number; grade: Grade }
export type TierGroup = { grade: Grade; entries: TierEntry[] }
