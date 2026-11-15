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
  const weights = weightsFor(preset, metrics)
  // 종합 점수에 관심 가산점을 더한 개인 점수·등급 (기록이 없으면 기본 값과 같다)
  const personal = personalize(
    regions.map((r) => Math.round(composite(r.scores, weights))),
    regions.map((r) => boost({ id: r.id, scores: r.scores })),
  )
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
            score={Math.round(personal[i].score)}
            scoreGrade={personal[i].grade}
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
