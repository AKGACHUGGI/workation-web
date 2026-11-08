import GradeBadge from '@/components/ui/GradeBadge'
import type { Grade } from '@/features/metric/types'
import type { ReportResponse } from '@/features/report/types'

type Props = { diagnosis: ReportResponse['diagnosis'] }

/** 강점(S) · 약점(C) · 제안(S). Figma W-06 v2 251:4587: 세 칸 bg-page p 16 radius lg. 문장은 백엔드 응답 */
export default function DiagnosisSection({ diagnosis }: Props) {
  const columns: { key: string; title: string; grade: Grade; body: string }[] = [
    { key: 'strength', title: '강점', grade: 'S', body: diagnosis.strength },
    { key: 'weakness', title: '약점', grade: 'C', body: diagnosis.weakness },
    { key: 'suggestion', title: '제안', grade: 'S', body: diagnosis.suggestion },
  ]
  return (
    <section className="border-border-default bg-bg-surface flex flex-col gap-4 rounded-xl border p-5">
      <div className="flex items-center justify-between">
        <h2 className="text-heading-lg text-text-primary">진단 요약</h2>
        <span className="text-caption-xs text-text-tertiary">규칙 기반 템플릿 (2차: LLM 문장)</span>
      </div>
      <div className="flex items-start gap-4">
        {columns.map((c) => (
          <div key={c.key} className="bg-bg-page flex min-w-0 flex-1 flex-col gap-2 rounded-lg p-4">
            <div className="flex items-center gap-2">
              <GradeBadge grade={c.grade} />
              <h3 className="text-body-base text-text-primary font-medium">{c.title}</h3>
            </div>
            <p className="text-body-sm text-text-secondary">{c.body}</p>
          </div>
        ))}
      </div>
    </section>
  )
}
