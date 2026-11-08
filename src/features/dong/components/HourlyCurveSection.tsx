import { useState } from 'react'
import Chip from '@/components/ui/Chip'
import Segmented from '@/components/ui/Segmented'
import HourlyCurveChart from '@/features/dong/components/HourlyCurveChart'
import { DONG_COPY } from '@/features/dong/copy'
import { monthWindow } from '@/features/dong/monthWindow'
import { formatHour } from '@/features/dong/summary'
import type { DayGroup, DongDetailResponse } from '@/features/dong/types'
import { monthLabel } from '@/features/metric/month'
import type { MonthParam } from '@/features/metric/month'

type Props = {
  id: string
  hourly: DongDetailResponse['hourly']
  peaks: DongDetailResponse['peaks']
  month: MonthParam
  onMonthChange: (m: MonthParam) => void
  animate?: boolean
}

const DAY_OPTIONS = [
  { value: 'weekday', label: '주중' },
  { value: 'weekend', label: '주말' },
] satisfies { value: DayGroup; label: string }[]

export default function HourlyCurveSection({
  id,
  hourly,
  peaks,
  month,
  onMonthChange,
  animate,
}: Props) {
  const [day, setDay] = useState<DayGroup>('weekday')
  const low = peaks[day]
  const cells = [
    { label: '주중 피크', value: `${formatHour(peaks.weekday.peakHour)} · 100` },
    { label: '가장 한산', value: `${formatHour(low.lowHour)} · ${low.lowValue}` },
    { label: '주말 피크', value: `${formatHour(peaks.weekend.peakHour)} · 100` },
  ]
  return (
    <section aria-labelledby="curve-title" className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h2 id="curve-title" className="text-heading-lg text-text-primary">
          {DONG_COPY.curveTitle}
        </h2>
        <div className="flex items-center gap-3">
          <div className="flex gap-2">
            {monthWindow(month).map((m) => (
              <Chip key={m} selected={m === month} onClick={() => onMonthChange(m)}>
                {monthLabel(m)}
              </Chip>
            ))}
          </div>
          <Segmented
            options={DAY_OPTIONS}
            value={day}
            onChange={setDay}
            ariaLabel="요일 구분"
            size="sm"
          />
        </div>
      </div>
      <HourlyCurveChart hourly={hourly} day={day} animate={animate} />
      <dl className="grid grid-cols-3 gap-4">
        {cells.map((c) => (
          <div key={c.label} className="bg-bg-subtle flex flex-col gap-1 rounded-xl p-4">
            <dt className="text-caption-xs text-text-tertiary">{c.label}</dt>
            <dd className="text-title-md text-text-primary">{c.value}</dd>
          </div>
        ))}
      </dl>
      <p className="text-caption-xs text-text-tertiary">{DONG_COPY.curveCaption(id)}</p>
    </section>
  )
}
