import { Bar, BarChart, Cell, Tooltip, XAxis } from 'recharts'
import { CROWD_BAR, CROWD_COLORS } from '@/features/region/components/crowdBarConfig'
import MonthTick from '@/features/region/components/MonthTick'
import { formatMonths } from '@/features/region/format'

type Props = {
  months: { month: number; crowd: number }[]
  bestMonths: number[]
  avoidMonths: number[]
  peerOffpeakMonths: number[]
  /** annual 이면 null (선택 강조 없음) */
  selectedMonth: number | null
  onSelectMonth: (month: number) => void
}

/** 월별 혼잡 지수 막대 12개 + 우측 추천 달 3줄 */
export default function MonthlyCrowdChart({
  months,
  bestMonths,
  avoidMonths,
  peerOffpeakMonths,
  selectedMonth,
  onSelectMonth,
}: Props) {
  const color = (m: number) =>
    bestMonths.includes(m)
      ? CROWD_COLORS.good
      : avoidMonths.includes(m)
        ? CROWD_COLORS.avoid
        : CROWD_COLORS.muted
  return (
    <section>
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-heading-lg text-text-primary">월별 혼잡 지수</h2>
        <ul className="text-caption-xs text-text-tertiary flex items-center gap-3">
          <li>시기 여유</li>
          <li className="text-signal-good">가기 좋은 달</li>
          <li className="text-signal-avoid">피할 달</li>
        </ul>
      </div>
      <div className="flex items-start gap-6">
        <BarChart
          width={CROWD_BAR.width}
          height={CROWD_BAR.height}
          data={months}
          margin={CROWD_BAR.margin}
        >
          <XAxis
            dataKey="month"
            tickLine={false}
            axisLine={false}
            tick={<MonthTick selected={selectedMonth} />}
            interval={0}
          />
          <Tooltip
            cursor={{ fill: CROWD_COLORS.grid }}
            content={({ active, payload }) => {
              // 스펙 §3-4 툴팁: `{m}월 · 혼잡 {crowd}`
              const row = payload?.[0]?.payload as { month: number; crowd: number } | undefined
              return active && row ? (
                <div className="bg-bg-surface border-border-default text-caption-xs text-text-primary shadow-float rounded-lg border px-3 py-2">
                  {row.month}월 · 혼잡 {row.crowd}
                </div>
              ) : null
            }}
          />
          <Bar
            dataKey="crowd"
            barSize={CROWD_BAR.barSize}
            radius={CROWD_BAR.radius}
            isAnimationActive={CROWD_BAR.isAnimationActive}
            onClick={(_data: unknown, index: number) => onSelectMonth(months[index].month)}
            className="cursor-pointer"
          >
            {months.map((m) => (
              <Cell key={m.month} fill={color(m.month)} />
            ))}
          </Bar>
        </BarChart>
        <dl className="text-body-sm flex flex-col gap-3">
          <div>
            <dt className="text-caption-xs text-text-tertiary">가기 좋은 달</dt>
            <dd className="text-text-primary font-medium">{formatMonths(bestMonths)}</dd>
          </div>
          <div>
            <dt className="text-caption-xs text-text-tertiary">피할 달</dt>
            <dd className="text-text-primary font-medium">{formatMonths(avoidMonths)}</dd>
          </div>
          <div>
            <dt className="text-caption-xs text-text-tertiary">또래 많고 덜 붐비는 달</dt>
            <dd className="text-text-primary font-medium">{formatMonths(peerOffpeakMonths)}</dd>
            <dd className="text-caption-xs text-text-tertiary">또래 비중 ↑ · 혼잡 ↓</dd>
          </div>
        </dl>
      </div>
    </section>
  )
}
