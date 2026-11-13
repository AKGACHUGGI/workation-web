import { EXPLORE_COPY } from '@/features/explore/copy'
import type { DayGroup } from '@/features/explore/types'

const DAYS: DayGroup[] = ['weekday', 'weekend']

/** ② 평일·주말 토글. 시간대 막대에만 영향이 있어 상세 칸 제목 줄에 둔다 (2026-11-13 사용자 결정) */
export default function DayToggle({
  day,
  onDay,
}: {
  day: DayGroup
  onDay: (day: DayGroup) => void
}) {
  return (
    <div
      role="tablist"
      aria-label={EXPLORE_COPY.dayToggleLabel}
      className="bg-bg-subtle -my-0.5 inline-flex shrink-0 rounded-full p-0.5"
    >
      {DAYS.map((d) => {
        const on = d === day
        return (
          <button
            key={d}
            type="button"
            role="tab"
            aria-selected={on}
            onClick={() => onDay(d)}
            className={`text-explore-2xs rounded-full px-2 py-0.5 ${on ? 'bg-bg-inverse text-text-inverse font-bold' : 'text-text-secondary'}`}
          >
            {EXPLORE_COPY.dayLabel[d]}
          </button>
        )
      })}
    </div>
  )
}
