import { useState } from 'react'
import GradeBadge from '@/components/ui/GradeBadge'
import type { MetricKey } from '@/features/metric/types'
import TierCard from '@/features/tier/components/TierCard'
import { TIER_RANGE } from '@/features/tier/copy'
import type { TierGroup, TierTab } from '@/features/tier/types'

type Props = {
  group: TierGroup
  description: string
  /** 행정동 범위: 두 줄(8개)까지 보이고 더보기 (펼침 상태는 로컬, URL 에 넣지 않음) */
  collapsible: boolean
  selected: MetricKey[] | null
  tab: TierTab
  /** 이 등급 첫 카드의 전체 순위 */
  rankStart?: number
}

const VISIBLE = 8

export default function TierSection({
  group,
  description,
  collapsible,
  selected,
  tab,
  rankStart = 1,
}: Props) {
  const [expanded, setExpanded] = useState(false)
  const { grade, entries } = group
  const overflow = collapsible && entries.length > VISIBLE
  const shown = overflow && !expanded ? entries.slice(0, VISIBLE) : entries
  // DESIGN-airbnb: 패널·색 박스 없이 흰 바탕 위 제목 줄 + 4열 사진 카드. 등급 사이는 헤어라인
  return (
    <section
      aria-label={`${grade} 등급`}
      className="border-border-default flex flex-col gap-6 border-t pt-8 first:border-t-0 first:pt-0"
    >
      <header className="flex items-end justify-between gap-6">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-3">
            <GradeBadge grade={grade} />
            <h2 className="text-heading-xl text-text-primary">{TIER_RANGE[grade]}</h2>
          </div>
          {description && <p className="text-body-sm text-text-secondary">{description}</p>}
        </div>
        <span className="text-body-sm text-text-secondary shrink-0">{entries.length}개 지역</span>
      </header>
      {entries.length === 0 ? (
        <p className="text-body-sm text-text-tertiary">이 등급에 해당하는 동네가 없습니다</p>
      ) : (
        <ul className="grid grid-cols-4 gap-x-6 gap-y-10">
          {shown.map((entry, i) => (
            <li key={entry.item.id} data-rank-id={entry.item.id}>
              <TierCard entry={entry} rank={rankStart + i} tab={tab} selected={selected} />
            </li>
          ))}
        </ul>
      )}
      {overflow && (
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          className="border-text-primary text-body-base text-text-primary hover:bg-bg-subtle self-start rounded-lg border px-6 py-3 font-medium"
        >
          {expanded ? '접기' : `+ ${entries.length - VISIBLE}개 더보기`}
        </button>
      )}
    </section>
  )
}
