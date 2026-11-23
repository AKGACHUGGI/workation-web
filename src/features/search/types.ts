import type { MonthParam } from '@/features/metric/month'
import type { PresetKey } from '@/features/metric/types'
import type { PlaceTag, Terrain } from '@/features/popular/types'

export type SearchParseRequest = { text: string }

export type IntentAxis = 'month' | 'preset' | 'terrain' | 'place' | 'stay' | 'peer'

export type SearchIntent = {
  month?: MonthParam
  monthRange?: number[]
  preset?: PresetKey
  terrain?: Terrain[]
  place?: PlaceTag[] // 장소 태그 (카페 많음 · 도서관 …). 홈 카테고리 place 쿼리
  stay?: 'week' | 'two_weeks' | 'month'
  peer?: boolean
  tags: { axis: IntentAxis; label: string }[]
}
