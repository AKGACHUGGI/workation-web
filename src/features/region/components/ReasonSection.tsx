import DetailSection from '@/features/region/components/DetailSection'

type Props = { sentences: string[] }

/** 추천 사유(규칙 템플릿). 2차 LLM 문장으로 교체 가능 */
export default function ReasonSection({ sentences }: Props) {
  return (
    <DetailSection title="추천 사유" caption="규칙 기반 템플릿(MVP) → 2차 LLM 문장">
      <p data-testid="reason" className="text-body-base text-text-primary max-w-200">
        {sentences.join(' ')}
      </p>
    </DetailSection>
  )
}
