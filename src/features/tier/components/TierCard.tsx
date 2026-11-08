import { Link } from 'react-router-dom'
import { GRADE_FG } from '@/components/ui/gradeClass'
import PhotoThumb from '@/components/ui/PhotoThumb'
import type { MetricKey } from '@/features/metric/types'
import SubGradeChips from '@/features/tier/components/SubGradeChips'
import type { TierEntry, TierTab } from '@/features/tier/types'
import { useCarryLink } from '@/hooks/useCarryLink'

type Props = {
  entry: TierEntry
  tab: TierTab
  /** 직접 설정에서 고른 지표 (흐림 표시용) */
  selected: MetricKey[] | null
  monthLabel: string
}

/** 카드 전체가 링크. 시군구 → W-03, 행정동 → W-04 (month·preset·metrics 유지) */
export default function TierCard({ entry, tab, selected, monthLabel }: Props) {
  const { item, score, grade } = entry
  const href = useCarryLink(item.sigungu ? `/dongs/${item.id}` : `/regions/${item.id}`)
  const sub = item.sigungu ? `${item.province} · ${item.sigungu.name}` : item.province
  return (
    <Link
      to={href}
      data-testid="tier-card"
      className="hover:shadow-float flex flex-col gap-2 rounded-xl"
    >
      <PhotoThumb photoUrl={item.photoUrl} alt={item.name} label={monthLabel} />
      <div className="flex items-center justify-between gap-2 px-1">
        <div className="min-w-0">
          <p className="text-title-md text-text-primary truncate">{item.name} ›</p>
          <p className="text-caption-xs text-text-tertiary truncate">{sub}</p>
        </div>
        <span className={`text-number-2xl shrink-0 ${GRADE_FG[grade]}`}>
          {Math.round(score)}
          <span className="text-body-sm">점</span>
        </span>
      </div>
      {tab === 'value' && (
        <div className="px-1 pb-2">
          <SubGradeChips scores={item.scores} selected={selected} inherited={item.inherited} />
        </div>
      )}
    </Link>
  )
}
