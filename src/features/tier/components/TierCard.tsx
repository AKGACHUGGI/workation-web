import { ChevronRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import FallbackImage from '@/components/ui/FallbackImage'
import { GRADE_FG } from '@/components/ui/gradeClass'
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

/**
 * Figma W-02 RegionTile(195:2271). 왼쪽 96×72 썸네일(하단 어두운 그라데이션 + 월 라벨) + 오른쪽 정보:
 * 이름 16 Medium · chevron / 시도 12 tertiary / 점수 24 Bold 등급색 + "점" / 세부 등급(밸류 탭).
 * 카드 전체가 링크. 시군구 → W-03, 행정동 → W-04 (month·preset·metrics 유지)
 */
export default function TierCard({ entry, tab, selected, monthLabel }: Props) {
  const { item, score, grade } = entry
  const href = useCarryLink(item.sigungu ? `/dongs/${item.id}` : `/regions/${item.id}`)
  const sub = item.sigungu ? `${item.province} · ${item.sigungu.name}` : item.province
  return (
    <Link
      to={href}
      data-testid="tier-card"
      className="border-border-default bg-bg-page hover:shadow-float flex items-center gap-3 rounded-lg border px-4 py-3"
    >
      <div className="relative h-18 w-24 shrink-0 overflow-hidden rounded-lg">
        <FallbackImage src={item.photoUrl} alt={item.name} className="h-full w-full object-cover" />
        <span
          aria-hidden
          className="to-scrim/45 absolute inset-0 bg-linear-to-b from-transparent"
        />
        <span className="bg-bg-inverse/55 text-caption-xs text-text-inverse absolute bottom-1.5 left-1.5 rounded-sm px-1.5 py-0.5 font-bold">
          {monthLabel}
        </span>
      </div>
      <div className="flex min-w-0 flex-1 flex-col gap-2">
        <div className="flex items-center justify-between gap-2">
          <span className="text-body-base text-text-primary truncate font-medium">{item.name}</span>
          <ChevronRight size={16} aria-hidden className="text-text-secondary shrink-0" />
        </div>
        <span className="text-caption-xs text-text-tertiary truncate">{sub}</span>
        <span className="flex items-end gap-0.5">
          <span className={`text-number-2xl ${GRADE_FG[grade]}`}>{Math.round(score)}</span>
          <span className="text-caption-xs text-text-tertiary">점</span>
        </span>
        {tab === 'value' && (
          <SubGradeChips scores={item.scores} selected={selected} inherited={item.inherited} />
        )}
      </div>
    </Link>
  )
}
