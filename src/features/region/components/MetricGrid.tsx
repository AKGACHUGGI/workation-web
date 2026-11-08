import MetricCard from '@/components/ui/MetricCard'
import { metricGrade } from '@/features/metric/score'
import type { MetricKey } from '@/features/metric/types'

type Props = {
  title?: string
  caption: string
  cards: { metric: MetricKey; score: number; subtitle: string }[]
}

/** 지표 카드 N개 (W-03 5종, W-04 4종) */
export default function MetricGrid({ title = '핵심 지표', caption, cards }: Props) {
  return (
    <section>
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-heading-lg text-text-primary">{title}</h2>
        <span className="text-caption-xs text-text-tertiary">{caption}</span>
      </div>
      <div className="grid grid-cols-5 gap-3">
        {cards.map((c) => (
          <MetricCard
            key={c.metric}
            metric={c.metric}
            score={c.score}
            grade={metricGrade(c.score)}
            subtitle={c.subtitle}
          />
        ))}
      </div>
    </section>
  )
}
