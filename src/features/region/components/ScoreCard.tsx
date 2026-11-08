import type { ReactNode } from 'react'
import laurel from '@/assets/icons/laurel.svg'

type Summary = { label: string; value: string; caption?: string }

type Props = {
  /** 큰 숫자. null 이면 '—' (W-04 특수시설 동) */
  score: number | null
  /** '조용한 곳 프리셋 · 12곳 중 3위 · S' */
  headline: ReactNode
  /** 세부 줄 '10월 기준 · 조용 A · …' */
  detail: ReactNode
  /** 요약 4칸 */
  summary: Summary[]
  /** 큰 숫자의 data-testid (W-03 'score', W-04 'quiet-score') */
  testId?: string
  ariaLabel?: string
}

/**
 * Figma ScoreDisplay(51:320) + 요약 4칸. 가운데 정렬, 월계수 장식 사이 64px 점수.
 * 점수·등급은 잉크색(브랜드·등급색을 쓰지 않음). W-03(프리셋 종합)·W-04(동네 조용함)가 같은 모양을 쓴다.
 */
export default function ScoreCard({
  score,
  headline,
  detail,
  summary,
  testId = 'score',
  ariaLabel,
}: Props) {
  return (
    <section
      aria-label={ariaLabel}
      className="border-border-default bg-bg-surface flex flex-col items-center rounded-xl border px-6 pt-2 pb-4"
    >
      <div className="flex flex-col items-center gap-2 px-6 py-4">
        <div className="flex items-center gap-3">
          <img src={laurel} alt="" width={40} height={40} />
          <span
            data-testid={testId}
            className="text-number-rating text-text-primary tracking-tight"
          >
            {score === null ? '—' : Math.round(score)}
          </span>
          <img src={laurel} alt="" width={40} height={40} />
        </div>
        <div className="text-title-md text-text-primary">{headline}</div>
        <div className="text-body-sm text-text-secondary flex items-center gap-1">{detail}</div>
      </div>
      <dl className="flex w-full items-start justify-between px-6 pt-4">
        {summary.map((s) => (
          <div key={s.label} className="flex flex-col items-center gap-0.5">
            {/* 숫자가 위, 라벨이 아래 (dt→dd 순서는 유지하고 order 로 뒤집는다) */}
            <dt className="text-caption-xs text-text-secondary order-last">
              {s.caption ? `${s.label} · ${s.caption}` : s.label}
            </dt>
            <dd className="text-heading-lg text-text-primary">{s.value}</dd>
          </div>
        ))}
      </dl>
    </section>
  )
}
