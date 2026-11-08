import { Bar, BarChart, Cell, XAxis, YAxis } from 'recharts'
import { weekendCopy, weekendSentence } from '@/features/region/copy'

type Props = { ratio: number }

/**
 * 큰 숫자 + 유형 + 가로 막대 2개(Recharts 가로 BarChart, 스펙 §2) + 설명 문장.
 * 주중 낮 = 1(기준), 주말 낮 = ratio. X 도메인을 max(1, ratio) 로 잡아 긴 막대가 전체 폭이 되게 비례 축소한다.
 */
export default function WeekendCompare({ ratio }: Props) {
  const data = [
    { label: '주중 낮', value: 1, fill: 'var(--color-chart-weekday)' },
    { label: '주말 낮', value: ratio, fill: 'var(--color-chart-weekend)' },
  ]
  return (
    <section>
      <h2 className="text-heading-lg text-text-primary mb-3">주중·주말 차이</h2>
      <div className="border-border-default rounded-2xl border p-6">
        <div className="flex items-end gap-3">
          <span className="text-number-4xl text-text-primary">{ratio.toFixed(2)}</span>
          <span className="text-title-md text-text-secondary pb-1">배 · {weekendCopy(ratio)}</span>
        </div>
        <div role="img" aria-label={`주중 낮 1.00 · 주말 낮 ${ratio.toFixed(2)}`} className="mt-4">
          <BarChart
            layout="vertical"
            width={560}
            height={64}
            data={data}
            margin={{ top: 0, right: 8, bottom: 0, left: 0 }}
          >
            <XAxis type="number" hide domain={[0, Math.max(1, ratio)]} />
            <YAxis
              type="category"
              dataKey="label"
              width={64}
              tickLine={false}
              axisLine={false}
              tick={{ fontSize: 12, fill: 'var(--color-text-tertiary)' }}
            />
            <Bar dataKey="value" barSize={12} radius={[0, 4, 4, 0]} isAnimationActive={false}>
              {data.map((d) => (
                <Cell key={d.label} fill={d.fill} />
              ))}
            </Bar>
          </BarChart>
        </div>
        <p className="text-body-sm text-text-secondary mt-4">{weekendSentence(ratio)}</p>
      </div>
    </section>
  )
}
