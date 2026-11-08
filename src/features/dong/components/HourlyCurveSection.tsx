import { useState } from 'react'
import { Columns2, Moon, Sun } from 'lucide-react'
import Chip from '@/components/ui/Chip'
import Segmented from '@/components/ui/Segmented'
import HourlyCurveChart from '@/features/dong/components/HourlyCurveChart'
import { DONG_COPY } from '@/features/dong/copy'
import { monthWindow } from '@/features/dong/monthWindow'
import { formatHour } from '@/features/dong/summary'
import type { DayGroup, DongDetailResponse } from '@/features/dong/types'
import { monthLabel } from '@/features/metric/month'
import type { MonthParam } from '@/features/metric/month'
import DetailSection from '@/features/region/components/DetailSection'

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

const LEGEND = [
  { label: '주중', swatch: 'bg-chart-weekday' },
  { label: '주말', swatch: 'bg-chart-weekend' },
]

/** 본문 열 폭(1376 - 레일 372 - 간격 48 = 956, Figma 251:3747)에 맞춘 고정 폭. Figma 곡선 180 + 시각 라벨 */
const CHART_WIDTH = 956
const CHART_HEIGHT = 212

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
    {
      icon: Sun,
      label: '주중 피크',
      value: `${formatHour(peaks.weekday.peakHour)} · 100`,
    },
    { icon: Moon, label: '가장 한산', value: `${formatHour(low.lowHour)} · ${low.lowValue}` },
    {
      icon: Columns2,
      label: '주말 피크',
      value: `${formatHour(peaks.weekend.peakHour)} · 100`,
    },
  ]
  return (
    <DetailSection
      title={DONG_COPY.curveTitle}
      titleId="curve-title"
      caption={DONG_COPY.curveCaption(id)}
    >
      <div className="flex items-center justify-between">
        <div className="flex gap-1.5">
          {monthWindow(month).map((m) => (
            <Chip key={m} size="md" selected={m === month} onClick={() => onMonthChange(m)}>
              {monthLabel(m)}
            </Chip>
          ))}
        </div>
        <Segmented
          variant="surface"
          ariaLabel="요일 구분"
          options={DAY_OPTIONS}
          value={day}
          onChange={setDay}
        />
      </div>
      <ul aria-hidden className="flex gap-4">
        {LEGEND.map((l) => (
          <li
            key={l.label}
            className="text-caption-xs text-text-secondary flex items-center gap-1.5"
          >
            <span className={`${l.swatch} h-0.75 w-4 rounded-xs`} />
            {l.label}
          </li>
        ))}
      </ul>
      <HourlyCurveChart
        hourly={hourly}
        day={day}
        animate={animate}
        width={CHART_WIDTH}
        height={CHART_HEIGHT}
      />
      <dl className="grid grid-cols-3 gap-3">
        {cells.map((c) => (
          // dl > div > dt·dd 구조를 지키려고 아이콘은 왼쪽 여백(pl-11)에 절대 배치한다
          <div key={c.label} className="bg-bg-subtle relative rounded-lg py-3 pr-4 pl-11">
            <c.icon
              size={18}
              aria-hidden
              className="text-text-secondary absolute top-1/2 left-4 -translate-y-1/2"
            />
            <dt className="text-caption-xs text-text-secondary">{c.label}</dt>
            <dd className="text-body-sm text-text-primary font-bold">{c.value}</dd>
          </div>
        ))}
      </dl>
    </DetailSection>
  )
}
