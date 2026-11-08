import { Bar, BarChart, Cell, Tooltip, XAxis } from 'recharts'
import { CROWD_BAR, CROWD_COLORS } from '@/features/region/components/crowdBarConfig'
import DetailSection from '@/features/region/components/DetailSection'
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

/**
 * Figma MonthlyBarChart(7:274) 크기: 막대 28 · 간격 12 · 12개 = 468, 막대 영역 120 + 월 라벨.
 * W-06 이 쓰는 CROWD_BAR 공유값(폭 640)은 그대로 두고 이 화면만 Figma 폭을 쓴다.
 */
const CHART = { width: 468, height: 146, margin: { top: 0, right: 0, bottom: 0, left: 0 } }

const LEGEND = [
  { label: '시기 여유', swatch: 'bg-chart-bar-muted' },
  { label: '가기 좋은 달', swatch: 'bg-signal-good' },
  { label: '피할 달', swatch: 'bg-signal-avoid' },
]

/** 월별 혼잡 지수 막대 12개 + 우측 색 배경 요약 3줄 */
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
    <DetailSection
      title="월별 혼잡 지수"
      caption="해당 월 방문인구 ÷ 연중 최대 × 100 · GET /regions/{id}/months"
    >
      <div className="flex items-start gap-8">
        <div className="flex shrink-0 flex-col gap-3">
          <ul className="flex items-center gap-4">
            {LEGEND.map((l) => (
              <li
                key={l.label}
                className="text-caption-xs text-text-secondary flex items-center gap-1.5"
              >
                <span aria-hidden className={`${l.swatch} size-2.5 rounded-xs`} />
                {l.label}
              </li>
            ))}
          </ul>
          <BarChart
            width={CHART.width}
            height={CHART.height}
            data={months}
            margin={CHART.margin}
            barCategoryGap={0}
          >
            <XAxis
              dataKey="month"
              tickLine={false}
              axisLine={false}
              tick={<MonthTick selected={selectedMonth} />}
              interval={0}
              height={26}
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
              radius={4}
              isAnimationActive={CROWD_BAR.isAnimationActive}
              onClick={(_data: unknown, index: number) => onSelectMonth(months[index].month)}
              className="cursor-pointer"
            >
              {months.map((m) => (
                <Cell key={m.month} fill={color(m.month)} />
              ))}
            </Bar>
          </BarChart>
        </div>
        <dl className="text-body-sm flex min-w-0 flex-1 flex-col gap-2.5">
          <div className="bg-signal-good-bg flex items-center justify-between rounded-lg px-3 py-2.5">
            <dt className="text-text-secondary">가기 좋은 달</dt>
            <dd className="text-signal-good font-medium">{formatMonths(bestMonths)}</dd>
          </div>
          <div className="bg-signal-avoid-bg flex items-center justify-between rounded-lg px-3 py-2.5">
            <dt className="text-text-secondary">피할 달</dt>
            <dd className="text-signal-avoid font-medium">{formatMonths(avoidMonths)}</dd>
          </div>
          <div className="bg-brand-soft flex items-center justify-between rounded-lg px-3 py-2.5">
            <dt className="text-text-secondary">또래 많고 덜 붐비는 달</dt>
            <dd className="text-text-brand font-medium">
              <span>{formatMonths(peerOffpeakMonths)}</span> <span>(또래 비중 ↑ · 혼잡 ↓)</span>
            </dd>
          </div>
        </dl>
      </div>
    </DetailSection>
  )
}
