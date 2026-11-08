import { Bar, BarChart, Cell, LabelList, Tooltip, XAxis } from 'recharts'
import { CROWD_COLORS } from '@/features/region/components/crowdBarConfig'
import { useElementWidth } from '@/hooks/useElementWidth'

type Props = {
  months: { month: number; crowd: number }[]
  /** 성수기 상위 3개월 */
  topMonths: number[]
  /** 백엔드 seasonNarrative */
  narrative: string
}

/** Figma W-06 v2 251:4442: 막대 44 · 막대 영역 180 + 값/월 라벨 */
const BAR = { height: 210, barSize: 44, radius: [4, 4, 0, 0] as [number, number, number, number] }
/** 측정 전 폭 (W-03 과 같은 640) */
const FALLBACK_WIDTH = 640

type LabelProps = {
  x?: number | string
  y?: number | string
  width?: number | string
  value?: unknown
  index?: number
}
type TickProps = {
  x?: number | string
  y?: number | string
  index?: number
  payload?: { value: string }
}

/** 월별 방문인구 지수. 상위 3개월은 잉크(chart-bar) 막대·값·월 라벨, 나머지는 chart-bar-muted·tertiary */
export default function AnnualCrowdChart({ months, topMonths, narrative }: Props) {
  const data = months.map((m) => ({
    ...m,
    label: `${m.month}월`,
    top: topMonths.includes(m.month),
  }))
  const [ref, width] = useElementWidth<HTMLDivElement>(FALLBACK_WIDTH)
  const labelFill = (i: number | undefined) =>
    i !== undefined && data[i]?.top ? 'var(--color-text-primary)' : 'var(--color-text-tertiary)'
  return (
    <section className="border-border-default bg-bg-surface flex flex-col gap-4 rounded-xl border p-5">
      <div className="flex items-center justify-between">
        <h2 className="text-heading-lg text-text-primary">월별 방문인구 지수</h2>
        <span className="text-caption-xs text-text-tertiary">
          연중 최대 월 = 100 · 상위 3개월 강조
        </span>
      </div>
      <div className="text-caption-xs text-text-secondary flex items-center gap-4">
        <span className="flex items-center gap-1.5">
          <span aria-hidden className="bg-chart-bar-muted size-2.5 rounded-xs" />
          방문 지수
        </span>
        <span className="flex items-center gap-1.5">
          <span aria-hidden className="bg-chart-bar size-2.5 rounded-xs" />
          성수기 상위 3개월
        </span>
      </div>
      <div ref={ref} className="w-full">
        <BarChart
          width={width}
          height={BAR.height}
          data={data}
          margin={{ top: 20, right: 0, bottom: 0, left: 0 }}
        >
          <XAxis
            dataKey="label"
            tickLine={false}
            axisLine={false}
            interval={0}
            tick={({ x, y, index, payload }: TickProps) => (
              <text
                x={x}
                y={Number(y ?? 0) + 12}
                textAnchor="middle"
                fontSize={12}
                fill={labelFill(index)}
              >
                {payload?.value}
              </text>
            )}
          />
          <Tooltip cursor={{ fill: CROWD_COLORS.grid }} formatter={(v) => [`방문 지수 ${v}`, '']} />
          <Bar dataKey="crowd" barSize={BAR.barSize} radius={BAR.radius} isAnimationActive={false}>
            <LabelList
              dataKey="crowd"
              content={({ x, y, width: w, value, index }: LabelProps) => (
                <text
                  x={Number(x) + Number(w) / 2}
                  y={Number(y) - 6}
                  textAnchor="middle"
                  fontSize={12}
                  fontWeight={500}
                  fill={labelFill(index)}
                >
                  {String(value)}
                </text>
              )}
            />
            {data.map((m) => (
              <Cell key={m.month} fill={m.top ? CROWD_COLORS.bar : CROWD_COLORS.muted} />
            ))}
          </Bar>
        </BarChart>
      </div>
      <p className="text-body-sm text-text-secondary">{narrative}</p>
    </section>
  )
}
