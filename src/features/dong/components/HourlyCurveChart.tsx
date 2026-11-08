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

/** Figma: W-04 전체 폭 곡선은 3시간 간격(251:3755), W-05 열(compact)은 0·6·12·18·23(251:4133) */
const TICKS = [0, 3, 6, 9, 12, 15, 18, 21, 23]
const COMPACT_TICKS = [0, 6, 12, 18, 23]

/** Figma 251:3740 범례: 주중 = chart/weekday(잉크), 주말 = chart/weekend(브랜드). 선택 안 된 선은 옅게 */
const STROKE: Record<DayGroup, string> = {
  weekday: 'var(--color-chart-weekday)',
  weekend: 'var(--color-chart-weekend)',
}

/** 양 끝 눈금(0시·23시)이 차트 밖으로 잘리지 않게 안쪽으로 정렬 */
function HourTick({
  x = 0,
  y = 0,
  payload,
}: {
  x?: number
  y?: number
  payload?: { value: number }
}) {
  const v = payload?.value ?? 0
  const anchor = v === 0 ? 'start' : v === 23 ? 'end' : 'middle'
  return (
    <text
      className="recharts-cartesian-axis-tick-value"
      x={x}
      y={y}
      dy={12}
      textAnchor={anchor}
      fontSize={12}
      fill="var(--color-text-tertiary)"
    >
      {`${v}시`}
    </text>
  )
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
        ticks={compact ? COMPACT_TICKS : TICKS}
        interval={0}
        tickLine={false}
        axisLine={false}
        tick={<HourTick />}
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
            stroke={STROKE[key]}
            strokeOpacity={key === day ? 1 : 0.45}
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
