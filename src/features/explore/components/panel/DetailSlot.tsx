import { EXPLORE_COPY } from '@/features/explore/copy'
import type { DayGroup, DetailKind, DongDetail } from '@/features/explore/types'
import HourBars from '@/features/explore/components/panel/HourBars'
import MonthBars from '@/features/explore/components/panel/MonthBars'
import { DONG_SECTION_H } from '@/features/explore/components/panel/panelLayout'

type Props = { detail: DetailKind; day: DayGroup; dong: DongDetail }

/**
 * ② 상세 칸 (Figma 436:10552). 높이 고정, 내용만 바꾸고 150ms 페이드 (스펙 §4).
 * key 가 바뀌면 안쪽만 다시 그려져 페이드가 다시 돈다
 */
export default function DetailSlot({ detail, day, dong }: Props) {
  return (
    <section
      aria-label={EXPLORE_COPY.detailLabel}
      data-section="detail"
      data-testid="detail-slot"
      className={`border-border-default bg-bg-surface shrink-0 overflow-hidden rounded-xl border px-3 pt-2.5 pb-2 ${DONG_SECTION_H.detail}`}
    >
      <div key={detail === 'hour' ? `hour-${day}` : 'month'} className="animate-explore-fade">
        {detail === 'hour' ? (
          <HourBars hourly={dong.hourly} day={day} />
        ) : (
          <MonthBars months={dong.months} />
        )}
      </div>
    </section>
  )
}
