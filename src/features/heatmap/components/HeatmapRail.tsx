import { useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import GoogleMapProvider from '@/components/map/GoogleMapProvider'
import { hasMapsKey } from '@/components/map/mapsKey'
import HeatLegend from '@/features/heatmap/components/HeatLegend'
import HeatmapControls from '@/features/heatmap/components/HeatmapControls'
import HeatmapSchematic from '@/features/heatmap/components/HeatmapSchematic'
import RegionHeatmap from '@/features/heatmap/components/RegionHeatmap'
import {
  DEFAULT_HEAT_METRIC,
  DEFAULT_SCOPE,
  parseHeatMetric,
  parseScope,
  parseSgg,
} from '@/features/heatmap/params'
import type { HeatMetric } from '@/features/heatmap/types'
import { useHeatEntries } from '@/features/heatmap/useHeatEntries'
import { useTerrainParam } from '@/features/popular/useTerrainParam'
import { useWeights } from '@/features/popular/useWeights'
import type { TierScope } from '@/features/tier/types'
import { useMonthParam, useQueryState } from '@/hooks/useQueryState'

const GUIDE_TITLE = '지역을 클릭하면 상세(W-03)로 이동'
const GUIDE_BODY =
  '행정동 레벨은 선택한 시군구 안에서만 표시됩니다. 지도 색은 선택한 지표의 점수(0~100)입니다.'
const SCHEMATIC_NOTE = '도식 지도 · 실제는 GeoJSON'
const PICK_SGG = '행정동을 보려면 시군구를 먼저 클릭하세요'

type Props = { hoverId: string | null; onHover: (id: string | null) => void }

/** 오른쪽 420px 히트맵 패널 */
export default function HeatmapRail({ hoverId, onHover }: Props) {
  const [month] = useMonthParam()
  const [scope, setScope] = useQueryState<TierScope>('scope', parseScope, DEFAULT_SCOPE)
  const [metric, setMetric] = useQueryState<HeatMetric>(
    'metric',
    parseHeatMetric,
    DEFAULT_HEAT_METRIC,
  )
  const [searchParams, setSearchParams] = useSearchParams()
  const sgg = parseSgg(searchParams.get('sgg'))
  const [terrain] = useTerrainParam()
  const { weights } = useWeights()

  const scoped = useHeatEntries({ month, scope, sgg, metric, weights, terrain })
  // 행정동 범위의 "시군구 먼저 클릭" 단계에서 시군구 폴리곤·칩을 그리기 위해 (scope=sigungu 면 같은 쿼리라 캐시 공유)
  const sigunguHeat = useHeatEntries({
    month,
    scope: 'sigungu',
    sgg: null,
    metric,
    weights,
    terrain,
  })

  // scope=sigungu 면 sgg 는 의미 없으니 지운다 (replace)
  useEffect(() => {
    if (scope === 'sigungu' && sgg !== null) {
      setSearchParams(
        (prev) => {
          const next = new URLSearchParams(prev)
          next.delete('sgg')
          return next
        },
        { replace: true },
      )
    }
  }, [scope, sgg, setSearchParams])

  const pickSigungu = (id: string) =>
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev)
      next.set('sgg', id)
      return next
    })

  const needPick = scope === 'dong' && sgg === null
  const { entries: shown, isPending, isError, refetch } = needPick ? sigunguHeat : scoped

  // Figma MapRail(274:4821): 패널(헤어라인 · rounded-xl · p 16 · 간격 12) + 그 아래 안내 박스(bg/subtle)
  return (
    <aside className="w-map-rail flex shrink-0 flex-col gap-4 self-start">
      <div className="border-border-default bg-bg-surface flex flex-col gap-3 rounded-xl border p-4">
        <HeatmapControls
          scope={scope}
          onScopeChange={setScope}
          metric={metric}
          onMetricChange={setMetric}
        />
        {isError ? (
          <div className="text-body-sm text-text-secondary flex items-center gap-2">
            히트맵을 불러오지 못했습니다
            <button type="button" onClick={() => refetch()} className="text-text-primary underline">
              다시 시도
            </button>
          </div>
        ) : (
          <GoogleMapProvider
            fallback={
              <HeatmapSchematic
                entries={shown}
                hoverId={hoverId}
                onHover={onHover}
                onPick={needPick ? pickSigungu : undefined}
                pending={isPending}
              />
            }
          >
            <RegionHeatmap
              scope={scope}
              sgg={sgg}
              pickMode={needPick}
              entries={shown}
              hoverId={hoverId}
              onHover={onHover}
              onPickSigungu={pickSigungu}
            />
          </GoogleMapProvider>
        )}
        {needPick && <p className="text-body-sm text-text-secondary">{PICK_SGG}</p>}
        <div className="flex items-center justify-between">
          <HeatLegend />
          {!hasMapsKey() && (
            <span className="text-caption-xs text-text-tertiary">{SCHEMATIC_NOTE}</span>
          )}
        </div>
      </div>
      <div className="bg-bg-subtle flex flex-col gap-1.5 rounded-xl p-4">
        <p className="text-body-sm text-text-primary font-medium">{GUIDE_TITLE}</p>
        <p className="text-body-sm text-text-secondary">{GUIDE_BODY}</p>
      </div>
    </aside>
  )
}
