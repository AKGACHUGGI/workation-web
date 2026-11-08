import { Bar, BarChart, Cell, XAxis, YAxis } from 'recharts'
import DetailSection from '@/features/region/components/DetailSection'
import { weekendCopy, weekendSentence } from '@/features/region/copy'

type Props = { ratio: number }

/**
 * Figma 246:2621: 막대 영역 803 = 라벨 48 + 간격 12 + 트랙 743, 막대 두께 8 · 행 간격 8.
 * 본문 열이 Figma(956)보다 4px 좁아(PageContainer px-10) 795 로 맞춘다.
 */
const CHART = { width: 795, height: 40, labelWidth: 60, barSize: 8 }

/**
 * 큰 숫자 + 유형 + 가로 막대 2개(Recharts 가로 BarChart, 스펙 §2) + 설명 문장.
 * 주중 낮 = 1(기준), 주말 낮 = ratio. X 도메인을 max(4, ratio) 로 잡아 기준 막대가 트랙의 1/4
 * (Figma 186/743), 4배를 넘으면 둘 다 비례 축소한다.
 */
export default function WeekendCompare({ ratio }: Props) {
  const data = [
    { label: '주중 낮', value: 1, fill: 'var(--color-chart-weekday)' },
    { label: '주말 낮', value: ratio, fill: 'var(--color-chart-weekend)' },
  ]
  return (
    <DetailSection title="주중·주말 차이" caption="주말 낮 체류 ÷ 주중 낮 체류">
      <div className="flex items-center gap-8">
        <div className="flex shrink-0 items-end gap-1.5">
          <span className="text-number-2xl text-text-primary">{ratio.toFixed(2)}</span>
          <span className="text-body-sm text-text-secondary">배 · {weekendCopy(ratio)}</span>
        </div>
        <div role="img" aria-label={`주중 낮 1.00 · 주말 낮 ${ratio.toFixed(2)}`}>
          <BarChart
            layout="vertical"
            width={CHART.width}
            height={CHART.height}
            data={data}
            margin={{ top: 0, right: 0, bottom: 0, left: 0 }}
          >
            <XAxis type="number" hide domain={[0, Math.max(4, ratio)]} />
            <YAxis
              type="category"
              dataKey="label"
              width={CHART.labelWidth}
              interval={0}
              tickLine={false}
              axisLine={false}
              tick={{ fontSize: 12, fill: 'var(--color-text-secondary)' }}
            />
            <Bar
              dataKey="value"
              barSize={CHART.barSize}
              radius={4}
              isAnimationActive={false}
              background={{ fill: 'var(--color-bg-subtle)', radius: 4 }}
            >
              {data.map((d) => (
                <Cell key={d.label} fill={d.fill} />
              ))}
            </Bar>
          </BarChart>
        </div>
      </div>
      <p className="text-body-sm text-text-secondary max-w-200">{weekendSentence(ratio)}</p>
    </DetailSection>
  )
}
