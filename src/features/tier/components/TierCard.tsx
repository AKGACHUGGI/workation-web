import { Link } from 'react-router-dom'
import FallbackImage from '@/components/ui/FallbackImage'
import GradeBadge from '@/components/ui/GradeBadge'
import type { MetricKey } from '@/features/metric/types'
import SubGradeChips from '@/features/tier/components/SubGradeChips'
import type { TierEntry, TierTab } from '@/features/tier/types'
import { useCarryLink } from '@/hooks/useCarryLink'

type Props = {
  entry: TierEntry
  /** 전체 순위 (등급을 이어서 1부터) */
  rank: number
  tab: TierTab
  /** 직접 설정에서 고른 지표 (흐림 표시용) */
  selected: MetricKey[] | null
}

/**
 * 사진 중심 카드 (DESIGN-airbnb property-card). 4:3 사진 · radius 14 · 왼쪽 위 흰 필 순위 배지,
 * 아래 메타: 이름 16 Semibold + 오른쪽 등급 배지 · 점수(잉크) / 시도 14 보조 / 세부 등급(밸류 탭).
 * 카드 전체가 링크. 시군구 → W-03, 행정동 → W-04 (month·preset·metrics 유지)
 */
export default function TierCard({ entry, rank, tab, selected }: Props) {
  const { item, score, grade } = entry
  const href = useCarryLink(item.sigungu ? `/dongs/${item.id}` : `/regions/${item.id}`)
  const sub = item.sigungu ? `${item.province} · ${item.sigungu.name}` : item.province
  return (
    <Link to={href} data-testid="tier-card" className="group flex flex-col gap-3">
      <div className="bg-bg-surface-strong relative aspect-4/3 overflow-hidden rounded-xl">
        <FallbackImage
          src={item.photoUrl}
          alt={item.name}
          className="h-full w-full object-cover transition-transform duration-300 ease-out group-hover:scale-[1.03]"
        />
        <span className="bg-bg-surface text-caption-xs text-text-primary shadow-float absolute top-3 left-3 rounded-full px-2.5 py-1 font-semibold">
          {rank}위
        </span>
      </div>
      <div className="flex flex-col gap-1">
        <div className="flex items-center justify-between gap-2">
          <span className="text-title-md text-text-primary truncate font-semibold">
            {item.name}
          </span>
          <span className="text-body-sm text-text-primary flex shrink-0 items-center gap-1.5 font-medium">
            <GradeBadge grade={grade} size="sm" />
            {Math.round(score)}점
          </span>
        </div>
        <span className="text-body-sm text-text-secondary truncate">{sub}</span>
        {tab === 'value' && (
          <div className="mt-1">
            <SubGradeChips scores={item.scores} selected={selected} inherited={item.inherited} />
          </div>
        )}
      </div>
    </Link>
  )
}
