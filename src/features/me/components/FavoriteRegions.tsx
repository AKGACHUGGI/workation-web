import ListingCard from '@/components/ui/ListingCard'
import { personalize, useBoost } from '@/features/interest'
import { favoriteMeta2, weightsFor } from '@/features/me/favoriteMeta'
import MePanel from '@/features/me/components/MePanel'
import type { FavoriteRegion } from '@/features/me/types'
import { useRemoveFavoriteWithUndo } from '@/features/me/useRemoveFavoriteWithUndo'
import { METRIC_SHORT_LABEL } from '@/features/metric/constants'
import { monthLabel } from '@/features/metric/month'
import type { MonthParam } from '@/features/metric/month'
import { composite, metricGrade } from '@/features/metric/score'
import type { MetricKey, PresetKey } from '@/features/metric/types'
import { useTierQuery } from '@/features/tier/useTierQuery'
import { useCarryLink } from '@/hooks/useCarryLink'

type Props = {
  regions: FavoriteRegion[]
  month: MonthParam
  preset: PresetKey
  metrics: MetricKey[] | null
}

const CHIP_KEYS: MetricKey[] = ['quiet', 'peer', 'overnight']

export default function FavoriteRegions({ regions, month, preset, metrics }: Props) {
  const remove = useRemoveFavoriteWithUndo()
  const boost = useBoost()
  // 즐겨찾기 응답에는 지형이 없어 같은 달 시군구 티어 항목의 terrain 을 쓴다 (티어표와 같은 BoostUnit)
  const tier = useTierQuery(month, 'sigungu')
  const terrainOf = new Map(tier.data?.items.map((t) => [t.id, t.terrain]))
  const weights = weightsFor(preset, metrics)
  const raw = regions.map((r) => composite(r.scores, weights))
  const boosts = regions.map((r) =>
    boost({ id: r.id, scores: r.scores, terrain: terrainOf.get(r.id) }),
  )
  // 등급은 기존처럼 반올림한 기본 점수로 매겨 기록이 없을 때 지금과 같게 하고,
  // 보이는 점수는 티어·상세처럼 반올림 전 기본 점수의 personalize 결과를 마지막에 한 번만 반올림한다
  const grades = personalize(
    raw.map((v) => Math.round(v)),
    boosts,
  ).map((p) => p.grade)
  const scores = personalize(raw, boosts).map((p) => Math.round(p.score))
  const base = useCarryLink('/regions')

  return (
    <MePanel
      title={`즐겨찾기 지역 ${regions.length}곳`}
      aside={`웹·앱 동기화 · ${monthLabel(month)} 기준`}
    >
      <div className="grid grid-cols-3 gap-6">
        {regions.map((r, i) => (
          <ListingCard
            key={r.id}
            photoUrl={r.photoUrl}
            title={`${r.name}, ${r.province}`}
            score={scores[i]}
            scoreGrade={grades[i]}
            meta1={r.tags.join(' · ')}
            meta2={favoriteMeta2(r, month)}
            chips={CHIP_KEYS.map((k) => ({
              label: METRIC_SHORT_LABEL[k],
              grade: metricGrade(r.scores[k]),
            }))}
            favorite
            onToggleFavorite={() => remove('regions', r.id, r.name)}
            href={base.replace('/regions', `/regions/${r.id}`)}
          />
        ))}
      </div>
    </MePanel>
  )
}
