import { useState } from 'react'
import { GRADE_BG, GRADE_FG } from '@/components/ui/gradeClass'
import type { MetricKey } from '@/features/metric/types'
import TierCard from '@/features/tier/components/TierCard'
import { TIER_RANGE } from '@/features/tier/copy'
import type { TierGroup, TierTab } from '@/features/tier/types'

type Props = {
  group: TierGroup
  description: string
  /** 행정동 범위: 6개까지 보이고 더보기 (펼침 상태는 로컬, URL 에 넣지 않음) */
  collapsible: boolean
  selected: MetricKey[] | null
  tab: TierTab
  monthLabel: string
}

const VISIBLE = 6

export default function TierSection({
  group,
  description,
  collapsible,
  selected,
  tab,
  monthLabel,
}: Props) {
  const [expanded, setExpanded] = useState(false)
  const { grade, entries } = group
  const overflow = collapsible && entries.length > VISIBLE
  const shown = overflow && !expanded ? entries.slice(0, VISIBLE) : entries
  return (
    <section
      aria-label={`${grade} 등급`}
      className="border-border-default flex overflow-hidden rounded-2xl border"
    >
      <div
        className={`flex w-40 shrink-0 flex-col gap-1 p-5 ${GRADE_BG[grade]} ${GRADE_FG[grade]}`}
      >
        <span className="font-display text-display-3xl">{grade}</span>
        <span className="text-body-sm font-medium">{TIER_RANGE[grade]}</span>
        <span className="text-caption-xs">{description}</span>
        <span className="text-caption-xs mt-auto">{entries.length}개 지역</span>
      </div>
      <div className="flex-1 p-5">
        {entries.length === 0 ? (
          <p className="text-body-sm text-text-tertiary">이 등급에 해당하는 동네가 없습니다</p>
        ) : (
          <ul className="grid grid-cols-3 gap-4">
            {shown.map((entry) => (
              <li key={entry.item.id}>
                <TierCard entry={entry} tab={tab} selected={selected} monthLabel={monthLabel} />
              </li>
            ))}
          </ul>
        )}
        {overflow && (
          <button
            type="button"
            onClick={() => setExpanded((v) => !v)}
            className="border-border-default text-body-sm text-text-primary hover:border-border-strong mt-4 rounded-lg border px-4 py-2"
          >
            {expanded ? '접기' : `+ ${entries.length - VISIBLE}개 더보기`}
          </button>
        )}
      </div>
    </section>
  )
}
