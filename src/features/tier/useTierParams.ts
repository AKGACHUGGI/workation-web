import { useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import type { MonthParam } from '@/features/metric/month'
import { parseMetrics, serializeMetrics } from '@/features/metric/params'
import type { MetricKey, PresetKey } from '@/features/metric/types'
import {
  correctTierParams,
  DEFAULT_METRICS,
  parseMetricKey,
  parseScope,
  parseSgg,
  parseTab,
} from '@/features/tier/params'
import type { TierScope, TierTab } from '@/features/tier/types'
import { useMonthParam, usePresetParam, useQueryState } from '@/hooks/useQueryState'
import type { SetQueryState } from '@/hooks/useQueryState'

export type TierParams = {
  tab: TierTab
  setTab: SetQueryState<TierTab>
  preset: PresetKey
  setPreset: SetQueryState<PresetKey>
  metrics: MetricKey[]
  setMetrics: SetQueryState<MetricKey[]>
  metric: MetricKey
  setMetric: SetQueryState<MetricKey>
  scope: TierScope
  setScope: SetQueryState<TierScope>
  sgg: string
  setSgg: SetQueryState<string>
  month: MonthParam
  setMonth: SetQueryState<MonthParam>
}

/** W-02 URL 상태 (스펙 §4). 모든 변경은 push, 보정은 replace */
export function useTierParams(): TierParams {
  const [searchParams, setSearchParams] = useSearchParams()
  const [tab, setTab] = useQueryState<TierTab>('tab', parseTab, 'value')
  const [preset, setPreset] = usePresetParam()
  const [metrics, setMetrics] = useQueryState<MetricKey[]>(
    'metrics',
    parseMetrics,
    DEFAULT_METRICS,
    serializeMetrics,
  )
  const [metric, setMetric] = useQueryState<MetricKey>('metric', parseMetricKey, 'quiet')
  const [scope, setScope] = useQueryState<TierScope>('scope', parseScope, 'sigungu')
  const [sgg, setSgg] = useQueryState<string>('sgg', parseSgg, 'all')
  const [month, setMonth] = useMonthParam()

  const needsCorrection = correctTierParams(searchParams) !== null
  useEffect(() => {
    if (!needsCorrection) return
    setSearchParams((prev) => correctTierParams(prev) ?? prev, { replace: true })
  }, [needsCorrection, searchParams, setSearchParams])

  return {
    tab,
    setTab,
    preset,
    setPreset,
    metrics,
    setMetrics,
    metric,
    setMetric,
    scope,
    setScope,
    sgg,
    setSgg,
    month,
    setMonth,
  }
}
