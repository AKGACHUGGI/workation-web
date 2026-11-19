import { useEffect } from 'react'
import { useBoost } from '@/features/interest'
import { buildTiers, filterTiers } from '@/features/tier/buildTiers'
import CustomMetricToggles from '@/features/tier/components/CustomMetricToggles'
import MetricGroupTabs from '@/features/tier/components/MetricGroupTabs'
import SigunguFilter from '@/features/tier/components/SigunguFilter'
import TierControls from '@/features/tier/components/TierControls'
import TierHeader from '@/features/tier/components/TierHeader'
import TierSection from '@/features/tier/components/TierSection'
import TierSkeleton from '@/features/tier/components/TierSkeleton'
import { tierDescription, tierFootnote } from '@/features/tier/copy'
import { toTierMode } from '@/features/tier/mode'
import { useTierParams } from '@/features/tier/useTierParams'
import { useTierQuery } from '@/features/tier/useTierQuery'
import { useRankMotion } from '@/hooks/useRankMotion'

/** W-02 랭킹. API 재호출은 month·scope 변경 때만, 나머지는 프론트 재계산 */
export default function TierPage() {
  const p = useTierParams()
  const query = useTierQuery(p.month, p.scope)
  const { data } = query
  const { scope, sgg, setSgg } = p
  const boost = useBoost()
  // 응답이 바뀌면(달·범위) 페이드, 같은 응답에서 기준만 바뀌면 카드가 새 순위 자리로 이동
  const motionRef = useRankMotion<HTMLDivElement>(data)

  // 응답에 없는 시군구 필터는 전체로 (replace)
  useEffect(() => {
    if (scope !== 'dong' || sgg === 'all' || data?.scope !== 'dong') return
    if (!data.items.some((i) => i.sigungu?.id === sgg)) setSgg('all', { replace: true })
  }, [scope, sgg, data, setSgg])

  const mode = toTierMode(p.tab, p.preset, p.metrics, p.metric)
  const groups = data
    ? filterTiers(buildTiers(data.items, mode, boost), scope === 'dong' ? sgg : 'all')
    : null
  const selected = p.tab === 'value' && p.preset === 'custom' ? p.metrics : null
  const copy = { tab: p.tab, preset: p.preset, metrics: p.metrics, metric: p.metric }

  return (
    // 본문: 좌우 32 · 위 32 (본문 폭 1376)
    <div className="max-w-page min-w-desktop mx-auto flex w-full flex-col gap-6 px-8 py-8">
      <TierHeader count={data?.items.length} scope={scope} onScopeChange={p.setScope} />
      <TierControls
        tab={p.tab}
        onTabChange={p.setTab}
        preset={p.preset}
        onPresetChange={p.setPreset}
        month={p.month}
        onMonthChange={p.setMonth}
      />
      {p.tab === 'value' && p.preset === 'custom' && (
        <CustomMetricToggles selected={p.metrics} onChange={p.setMetrics} />
      )}
      {p.tab === 'metric' && (
        <MetricGroupTabs metric={p.metric} scope={scope} onChange={p.setMetric} />
      )}
      {scope === 'dong' && data?.scope === 'dong' && (
        <SigunguFilter items={data.items} value={sgg} onChange={p.setSgg} />
      )}

      {query.isPending ? (
        <TierSkeleton />
      ) : query.isError || !groups ? (
        <div className="border-border-default flex flex-col items-start gap-4 rounded-xl border p-8">
          <p className="text-body-base text-text-primary">랭킹을 불러오지 못했습니다</p>
          <button
            type="button"
            onClick={() => void query.refetch()}
            className="bg-brand-primary text-body-base text-text-inverse hover:bg-brand-hover rounded-lg px-6 py-3 font-medium"
          >
            다시 시도
          </button>
        </div>
      ) : (
        <div
          ref={motionRef}
          className={`mt-4 flex flex-col gap-12 ${query.isPlaceholderData ? 'opacity-60' : ''}`}
        >
          {groups.map((group, i) => (
            <TierSection
              key={group.grade}
              group={group}
              description={tierDescription(copy, group.grade)}
              collapsible={scope === 'dong'}
              selected={selected}
              tab={p.tab}
              // 순위는 등급을 이어서 센다 (앞 등급 개수 합 + 1)
              rankStart={groups.slice(0, i).reduce((n, g) => n + g.entries.length, 1)}
            />
          ))}
        </div>
      )}

      <p className="text-caption-xs text-text-tertiary">{tierFootnote(copy)}</p>
    </div>
  )
}
