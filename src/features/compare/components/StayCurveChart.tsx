import { CartesianGrid, Line, LineChart, Tooltip, XAxis, YAxis } from 'recharts'
import { COMPARE_COPY } from '@/features/compare/copy'
import { formatPeople, stayTicks } from '@/features/compare/stayScale'
import type { DayGroup } from '@/features/dong/types'

type Props = {
  /** 길이 24, 시간대별 평균 체류인구(명) */
  values: number[]
  day: DayGroup
  /** 비교 열들이 함께 쓰는 세로축 최대값. 열끼리 높이를 그대로 견줄 수 있다 */
  yMax: number
  width: number
  height: number
  /** 테스트에서 false */
  animate?: boolean
}

/** Figma W-05 열 x축과 같은 0·6·12·18·23 */
const HOUR_TICKS = [0, 6, 12, 18, 23]

/** 주중 = chart/weekday(잉크), 주말 = chart/weekend(브랜드). HourlyCurveChart 와 같은 색 */
const STAY_STROKE: Record<DayGroup, string> = {
  weekday: 'var(--color-chart-weekday)',
  weekend: 'var(--color-chart-weekend)',
}

const AXIS_TEXT = { fontSize: 12, fill: 'var(--color-text-tertiary)' }

/** 양 끝 시각 눈금(0시·23시)이 차트 밖으로 잘리지 않게 안쪽 정렬 */
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
    <text x={x} y={y} dy={12} textAnchor={anchor} {...AXIS_TEXT}>
      {`${v}시`}
    </text>
  )
}

/** W-05 비교 열: 고른 요일그룹의 24시간 체류인구 한 줄 */
export default function StayCurveChart({
  values,
  day,
  yMax,
  width,
  height,
  animate = true,
}: Props) {
  const data = values.map((v, h) => ({ h, v }))
  return (
    <LineChart
      width={width}
      height={height}
      data={data}
      margin={{ top: 8, right: 8, bottom: 0, left: 0 }}
    >
      <CartesianGrid vertical={false} stroke="var(--color-chart-grid)" />
      <XAxis
        dataKey="h"
        ticks={HOUR_TICKS}
        interval={0}
        tickLine={false}
        axisLine={false}
        tick={<HourTick />}
      />
      <YAxis
        domain={[0, yMax]}
        ticks={stayTicks(yMax)}
        interval={0}
        width={48}
        tickLine={false}
        axisLine={false}
        tick={AXIS_TEXT}
        tickFormatter={formatPeople}
      />
      <Tooltip
        content={({ active, label }) =>
          active && typeof label === 'number' ? (
            <div className="bg-bg-surface border-border-default text-caption-xs text-text-primary shadow-float rounded-lg border px-3 py-2">
              {COMPARE_COPY.stayTooltip(label, day, values[label])}
            </div>
          ) : null
        }
      />
      <Line
        key={day} // 요일을 바꾸면 선을 다시 그린다
        type="monotone"
        dataKey="v"
        stroke={STAY_STROKE[day]}
        strokeWidth={2.5}
        dot={false}
        activeDot={{ r: 4 }}
        isAnimationActive={animate}
        animationDuration={300}
      />
    </LineChart>
  )
}
