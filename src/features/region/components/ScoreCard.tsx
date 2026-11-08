import type { ReactNode } from 'react'

type Summary = { label: string; value: string; caption?: string }

type Props = {
  /** 큰 숫자 */
  score: number
  /** '조용한 곳 프리셋 · 12곳 중 3위 · S' */
  headline: string
  /** 세부 줄(등급 칩 등) */
  detail: ReactNode
  /** 요약 4칸 */
  summary: Summary[]
}

/** 종합 점수 카드. W-03(프리셋 종합)·W-04(동네 조용함)가 같은 모양을 쓴다 */
export default function ScoreCard({ score, headline, detail, summary }: Props) {
  return (
    <section className="border-border-default bg-bg-surface rounded-2xl border p-6">
      <div className="flex items-end gap-4">
        <span data-testid="score" className="text-number-rating text-text-primary">
          {Math.round(score)}
        </span>
        <div className="flex flex-col gap-1 pb-2">
          <span className="text-title-md text-text-primary">{headline}</span>
          <div className="text-caption-xs text-text-secondary flex items-center gap-2">
            {detail}
          </div>
        </div>
      </div>
      <dl className="mt-6 grid grid-cols-4 gap-3">
        {summary.map((s) => (
          <div key={s.label} className="bg-bg-subtle rounded-xl p-3">
            <dt className="text-caption-xs text-text-tertiary">{s.label}</dt>
            <dd className="text-title-md text-text-primary mt-1">{s.value}</dd>
            {s.caption && <dd className="text-caption-xs text-text-secondary mt-1">{s.caption}</dd>}
          </div>
        ))}
      </dl>
    </section>
  )
}
