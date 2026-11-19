import SlidingThumb from '@/components/ui/SlidingThumb'
import { EXPLORE_COPY } from '@/features/explore/copy'
import type { DayGroup } from '@/features/explore/types'
import useSlidingThumb from '@/hooks/useSlidingThumb'

const DAYS: DayGroup[] = ['weekday', 'weekend']

/**
 * ② 평일·주말 토글. 시간대 막대에만 영향이 있어 상세 칸 제목 줄에 둔다 (2026-11-13 사용자 결정).
 * 선택 칸은 Segmented 와 같은 움직이는 칸. 굵기가 바뀌면 칸 폭이 흔들려 두 탭 모두 bold
 */
export default function DayToggle({
  day,
  onDay,
}: {
  day: DayGroup
  onDay: (day: DayGroup) => void
}) {
  const { listRef, thumbRef, thumb } = useSlidingThumb(day)
  return (
    <div
      ref={listRef}
      role="tablist"
      aria-label={EXPLORE_COPY.dayToggleLabel}
      className="bg-bg-subtle relative -my-0.5 inline-flex shrink-0 rounded-full p-0.5"
    >
      <SlidingThumb thumbRef={thumbRef} thumb={thumb} className="bg-bg-inverse rounded-full" />
      {DAYS.map((d) => {
        const on = d === day
        return (
          <button
            key={d}
            type="button"
            role="tab"
            aria-selected={on}
            onClick={() => onDay(d)}
            className={`text-explore-2xs relative rounded-full px-2 py-0.5 font-bold transition-colors delay-75 duration-200 motion-reduce:transition-none ${on ? 'text-text-inverse' : 'text-text-secondary hover:text-text-primary'}`}
          >
            {EXPLORE_COPY.dayLabel[d]}
          </button>
        )
      })}
    </div>
  )
}
