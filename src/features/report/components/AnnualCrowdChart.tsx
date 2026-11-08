import { Bar, BarChart, Cell, LabelList, Tooltip, XAxis } from 'recharts'
import { CROWD_BAR, CROWD_COLORS } from '@/features/region/components/crowdBarConfig'

type Props = {
  months: { month: number; crowd: number }[]
  /** 성수기 상위 3개월 */
  topMonths: number[]
  /** 백엔드 seasonNarrative */
  narrative: string
}

/** 월별 방문인구 지수. 상위 3개월 brand, 나머지 chart-bar-muted. W-03 MonthlyCrowdChart 와 BarChart 설정 공유 */
export default function AnnualCrowdChart({ months, topMonths, narrative }: Props) {
  const data = months.map((m) => ({ ...m, label: `${m.month}월` }))
  return (
    <section className="border-border-default bg-bg-surface rounded-xl border p-6">
      <div className="flex items-center justify-between">
        <h2 className="text-heading-lg text-text-primary">월별 방문인구 지수</h2>
        <span className="text-caption-xs text-text-tertiary">방문 지수 · 성수기 상위 3개월</span>
      </div>
      <div className="mt-4">
        <BarChart
          width={CROWD_BAR.width}
          height={CROWD_BAR.height}
          data={data}
          margin={CROWD_BAR.margin}
        >
          <XAxis
            dataKey="label"
            tickLine={false}
            axisLine={false}
            interval={0}
            tick={{ fontSize: 12, fill: 'var(--color-text-tertiary)' }}
          />
          <Tooltip cursor={{ fill: CROWD_COLORS.grid }} formatter={(v) => [`방문 지수 ${v}`, '']} />
          <Bar
            dataKey="crowd"
            barSize={CROWD_BAR.barSize}
            radius={CROWD_BAR.radius}
            isAnimationActive={CROWD_BAR.isAnimationActive}
          >
            <LabelList
              dataKey="crowd"
              position="top"
              className="text-caption-xs"
              fill="var(--color-text-secondary)"
            />
            {data.map((m) => (
              <Cell
                key={m.month}
                fill={topMonths.includes(m.month) ? CROWD_COLORS.brand : CROWD_COLORS.muted}
              />
            ))}
          </Bar>
        </BarChart>
      </div>
      <p className="text-body-sm text-text-secondary mt-4">{narrative}</p>
    </section>
  )
}
