type Props = { sentences: string[] }

/** 추천 사유(규칙 템플릿). 2차 LLM 문장으로 교체 가능 */
export default function ReasonSection({ sentences }: Props) {
  return (
    <section>
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-heading-lg text-text-primary">추천 사유</h2>
        <span className="text-caption-xs text-text-tertiary">
          규칙 기반 템플릿(MVP) → 2차 LLM 문장
        </span>
      </div>
      <p
        data-testid="reason"
        className="text-body-base text-text-primary bg-bg-subtle rounded-2xl p-6"
      >
        {sentences.join(' ')}
      </p>
    </section>
  )
}
