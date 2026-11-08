import MetricCard from '@/components/ui/MetricCard'
import DetailSection from '@/features/region/components/DetailSection'
import { metricGrade } from '@/features/metric/score'
import type { MetricKey } from '@/features/metric/types'

type Props = {
  title?: string
  caption: string
  cards: { metric: MetricKey; score: number; subtitle: string }[]
}

/** 지표 카드 N개 (W-03 5종). 제목은 Figma 대로 '핵심 지표 5종' */
export default function MetricGrid({ title = '핵심 지표', caption, cards }: Props) {
  return (
    <DetailSection title={`${title} ${cards.length}종`} caption={caption}>
      <div className="grid grid-cols-5 items-start gap-4">
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
    </DetailSection>
  )
}
