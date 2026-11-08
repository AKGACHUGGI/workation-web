import { Loader2 } from 'lucide-react'
import { useLocation, useNavigate } from 'react-router-dom'
import Dropdown from '@/components/ui/Dropdown'
import Tag from '@/components/ui/Tag'
import { REPORT_DESCRIPTION } from '@/features/report/copy'
import { SIGUNGU_OPTIONS } from '@/features/report/sigungu'
import { carryQuery } from '@/hooks/carryQuery'

type Props = {
  currentId: string
  onExportPdf: () => void
  isExporting: boolean
}

/** Figma W-06 v2 251:4395: 제목(30) · "2차 기능" 태그 · 설명(16) / 시군구 드롭다운 · PDF 내보내기(secondary 버튼) */
export default function ReportHeader({ currentId, onExportPdf, isExporting }: Props) {
  const navigate = useNavigate()
  const { search } = useLocation()
  const goTo = (id: string) => navigate(carryQuery(`/reports/${id}`, new URLSearchParams(search)))
  return (
    <header className="flex items-end justify-between gap-6">
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-3">
          <h1 className="text-display-3xl text-text-primary tracking-tight">지자체 진단 리포트</h1>
          <Tag tone="brand">2차 기능</Tag>
        </div>
        <p className="text-body-base text-text-secondary">{REPORT_DESCRIPTION}</p>
      </div>
      <div className="flex shrink-0 items-center gap-2">
        <Dropdown
          options={SIGUNGU_OPTIONS}
          value={currentId}
          onChange={goTo}
          ariaLabel="시군구"
          variant="strong"
          className="w-50"
        />
        <button
          type="button"
          onClick={onExportPdf}
          disabled={isExporting}
          aria-busy={isExporting}
          className="border-text-primary bg-bg-surface text-body-base text-text-primary hover:bg-bg-subtle disabled:opacity-dim inline-flex h-10 items-center gap-2 rounded-lg border px-6 font-medium disabled:cursor-not-allowed"
        >
          {isExporting && <Loader2 aria-hidden className="size-4 animate-spin" />}
          PDF 내보내기
        </button>
      </div>
    </header>
  )
}
