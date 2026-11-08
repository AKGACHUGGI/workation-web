import { useState } from 'react'
import GradeBadge from '@/components/ui/GradeBadge'
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
  // Figma Tier/S(195:2264): 흰 패널 · 헤어라인 · rounded-xl · p 16 · gap 16.
  // 왼쪽 176px 등급 카드(등급 배경 · GradeBadge md · 범위 16 Medium 등급색 · 설명 12 · 개수 12 tertiary)
  return (
    <section
      aria-label={`${grade} 등급`}
      className="border-border-default bg-bg-surface flex gap-4 rounded-xl border p-4"
    >
      <div className={`flex w-44 shrink-0 flex-col gap-2 rounded-lg p-4 ${GRADE_BG[grade]}`}>
        <GradeBadge grade={grade} className="self-start" />
        <span className={`text-body-base font-medium ${GRADE_FG[grade]}`}>{TIER_RANGE[grade]}</span>
        <span className="text-caption-xs text-text-secondary">{description}</span>
        <span className="text-caption-xs text-text-tertiary">{entries.length}개 지역</span>
      </div>
      <div className="min-w-0 flex-1">
        {entries.length === 0 ? (
          <p className="text-body-sm text-text-tertiary">이 등급에 해당하는 동네가 없습니다</p>
        ) : (
          <ul className="grid grid-cols-3 gap-3">
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
