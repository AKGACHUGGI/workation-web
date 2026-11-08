import type { MonthParam } from '@/features/metric/month'
import type { PresetKey } from '@/features/metric/types'
import type { Terrain } from '@/features/popular/types'

export type SearchParseRequest = { text: string }

export type IntentAxis = 'month' | 'preset' | 'terrain' | 'stay' | 'peer'

export type SearchIntent = {
  month?: MonthParam
  monthRange?: number[]
  preset?: PresetKey
  terrain?: Terrain[]
  stay?: 'week' | 'two_weeks' | 'month'
  peer?: boolean
  tags: { axis: IntentAxis; label: string }[]
}
