import { useEffect } from 'react'
import PageContainer from '@/components/layout/PageContainer'
import { monthLabel } from '@/features/metric/month'
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

/** W-02 티어리스트. API 재호출은 month·scope 변경 때만, 나머지는 프론트 재계산 */
export default function TierPage() {
  const p = useTierParams()
  const query = useTierQuery(p.month, p.scope)
  const { data } = query
  const { scope, sgg, setSgg } = p

  // 응답에 없는 시군구 필터는 전체로 (replace)
  useEffect(() => {
    if (scope !== 'dong' || sgg === 'all' || data?.scope !== 'dong') return
    if (!data.items.some((i) => i.sigungu?.id === sgg)) setSgg('all', { replace: true })
  }, [scope, sgg, data, setSgg])

  const mode = toTierMode(p.tab, p.preset, p.metrics, p.metric)
  const groups = data
    ? filterTiers(buildTiers(data.items, mode), scope === 'dong' ? sgg : 'all')
    : null
  const selected = p.tab === 'value' && p.preset === 'custom' ? p.metrics : null
  const copy = { tab: p.tab, preset: p.preset, metrics: p.metrics, metric: p.metric }

  return (
    <PageContainer className="flex flex-col gap-6 py-10">
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
        <div className="border-border-default flex flex-col items-start gap-3 rounded-2xl border p-8">
          <p className="text-body-base text-text-primary">티어 정보를 불러오지 못했습니다</p>
          <button
            type="button"
            onClick={() => void query.refetch()}
            className="bg-brand-primary text-body-sm text-text-inverse hover:bg-brand-hover rounded-lg px-4 py-2"
          >
            다시 시도
          </button>
        </div>
      ) : (
        <div className={`flex flex-col gap-4 ${query.isPlaceholderData ? 'opacity-60' : ''}`}>
          {groups.map((group) => (
            <TierSection
              key={group.grade}
              group={group}
              description={tierDescription(copy, group.grade)}
              collapsible={scope === 'dong'}
              selected={selected}
              tab={p.tab}
              monthLabel={monthLabel(p.month)}
            />
          ))}
        </div>
      )}

      <p className="text-caption-xs text-text-tertiary">{tierFootnote(copy)}</p>
    </PageContainer>
  )
}
