import { Sparkles } from 'lucide-react'
import GradeBadge from '@/components/ui/GradeBadge'
import type { ReportResponse } from '@/features/report/types'

type Props = { diagnosis: ReportResponse['diagnosis'] }

/** 강점(S) · 약점(C) · 제안(sparkles). 문장은 백엔드 응답 */
export default function DiagnosisSection({ diagnosis }: Props) {
  const columns = [
    { key: 'strength', title: '강점', icon: <GradeBadge grade="S" />, body: diagnosis.strength },
    { key: 'weakness', title: '약점', icon: <GradeBadge grade="C" />, body: diagnosis.weakness },
    {
      key: 'suggestion',
      title: '제안',
      icon: <Sparkles aria-hidden className="text-brand-primary size-6" />,
      body: diagnosis.suggestion,
    },
  ]
  return (
    <section className="border-border-default bg-bg-surface rounded-xl border p-6">
      <div className="flex items-center justify-between">
        <h2 className="text-heading-lg text-text-primary">진단 요약</h2>
        <span className="text-caption-xs text-text-tertiary">규칙 기반 템플릿 (2차: LLM 문장)</span>
      </div>
      <div className="mt-4 grid grid-cols-3 gap-6">
        {columns.map((c) => (
          <div key={c.key} className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
              {c.icon}
              <h3 className="text-title-md text-text-primary">{c.title}</h3>
            </div>
            <p className="text-body-sm text-text-secondary">{c.body}</p>
          </div>
        ))}
      </div>
    </section>
  )
}
