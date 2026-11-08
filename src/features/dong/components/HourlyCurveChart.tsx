import { CartesianGrid, Line, LineChart, Tooltip, XAxis, YAxis } from 'recharts'
import { DONG_COPY } from '@/features/dong/copy'
import type { DayGroup } from '@/features/dong/types'

type Props = {
  hourly: Record<DayGroup, number[]>
  /** 강조할 선 */
  day: DayGroup
  /** W-05 열용: 높이 160, 축 라벨 최소화 */
  compact?: boolean
  height?: number
  /** 고정 폭 (기본 760 = 본문 열 폭 - 패딩). W-05 열은 300 */
  width?: number
  /** 테스트에서 false */
  animate?: boolean
}

const TICKS = [0, 3, 6, 9, 12, 15, 18, 21, 23]

function strokeOf(selected: boolean) {
  return selected ? 'var(--color-chart-line-strong)' : 'var(--color-chart-line-muted)'
}

/** 24시간 보행 곡선. 주중·주말 선 2개, 선택한 날은 진하게 */
export default function HourlyCurveChart({
  hourly,
  day,
  compact = false,
  height,
  width = 760,
  animate = true,
}: Props) {
  const data = Array.from({ length: 24 }, (_, h) => ({
    h,
    weekday: hourly.weekday[h],
    weekend: hourly.weekend[h],
  }))
  const h = height ?? (compact ? 160 : 240)
  return (
    <LineChart
      width={width}
      height={h}
      data={data}
      margin={{ top: 8, right: 8, bottom: 0, left: 0 }}
    >
      <CartesianGrid vertical={false} stroke="var(--color-chart-grid)" />
      <XAxis
        dataKey="h"
        ticks={TICKS}
        tickFormatter={(v: number) => `${v}시`}
        tickLine={false}
        axisLine={false}
        tick={{ fontSize: compact ? 10 : 12, fill: 'var(--color-text-tertiary)' }}
      />
      <YAxis hide domain={[0, 100]} />
      <Tooltip
        content={({ active, label }) =>
          active && typeof label === 'number' ? (
            <div className="bg-bg-surface border-border-default text-caption-xs text-text-primary shadow-float rounded-lg border px-3 py-2">
              {DONG_COPY.curveTooltip(label, hourly.weekday[label], hourly.weekend[label])}
            </div>
          ) : null
        }
      />
      {(['weekend', 'weekday'] as DayGroup[])
        .sort((a) => (a === day ? 1 : -1)) // 선택한 선을 마지막(위)에
        .map((key) => (
          <Line
            key={key}
            className={`curve-${key}`}
            type="monotone"
            dataKey={key}
            name={key}
            stroke={strokeOf(key === day)}
            strokeWidth={key === day ? 3 : 1.5}
            dot={false}
            activeDot={{ r: 4 }}
            isAnimationActive={animate}
            animationDuration={300}
          />
        ))}
    </LineChart>
  )
}
