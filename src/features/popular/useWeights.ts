import { useCallback, useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import { PRESET_WEIGHTS } from '@/features/metric/constants'
import { parseMetrics, serializeMetrics } from '@/features/metric/params'
import type { MetricKey, PresetKey, Weights } from '@/features/metric/types'
import { DEFAULT_CUSTOM_METRICS } from '@/features/region/presetMode'
import { customWeights } from '@/features/tier/buildTiers'
import { usePresetParam } from '@/hooks/useQueryState'

/**
 * preset·metrics 쿼리 → 가중치. W-02 의 useWeights 와 같은 시그니처.
 * 기본 선택은 W-03 usePresetMode 와 같은 DEFAULT_CUSTOM_METRICS.
 * selected·weights 는 URL 값이 같으면 참조를 유지한다 (히트맵 폴리곤 getStyle 재생성 방지).
 */
export function useWeights() {
  const [preset, setPreset] = usePresetParam()
  const [searchParams, setSearchParams] = useSearchParams()
  const rawMetrics = searchParams.get('metrics')
  const selected = useMemo(() => parseMetrics(rawMetrics) ?? DEFAULT_CUSTOM_METRICS, [rawMetrics])
  const setSelected = useCallback(
    (keys: MetricKey[]) => {
      setSearchParams((prev) => {
        const next = new URLSearchParams(prev)
        next.set('preset', 'custom')
        next.set('metrics', serializeMetrics(keys))
        return next
      })
    },
    [setSearchParams],
  )
  const weights = useMemo<Weights>(
    () => (preset === 'custom' ? customWeights(selected) : PRESET_WEIGHTS[preset]),
    [preset, selected],
  )
  return { preset, setPreset: setPreset as (p: PresetKey) => void, selected, setSelected, weights }
}
