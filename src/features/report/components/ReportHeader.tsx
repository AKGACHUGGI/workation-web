import { Download, Loader2 } from 'lucide-react'
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

/** 제목 · "2차 기능" 태그 · 시군구 드롭다운 · PDF 내보내기 */
export default function ReportHeader({ currentId, onExportPdf, isExporting }: Props) {
  const navigate = useNavigate()
  const { search } = useLocation()
  const goTo = (id: string) => navigate(carryQuery(`/reports/${id}`, new URLSearchParams(search)))
  return (
    <header className="flex items-start justify-between">
      <div>
        <div className="flex items-center gap-2">
          <h1 className="text-heading-2xl text-text-primary">지자체 진단 리포트</h1>
          <Tag>2차 기능</Tag>
        </div>
        <p className="text-body-sm text-text-secondary mt-2">{REPORT_DESCRIPTION}</p>
      </div>
      <div className="flex items-center gap-3">
        <Dropdown options={SIGUNGU_OPTIONS} value={currentId} onChange={goTo} ariaLabel="시군구" />
        <button
          type="button"
          onClick={onExportPdf}
          disabled={isExporting}
          aria-busy={isExporting}
          className="bg-brand-primary text-body-sm text-text-inverse hover:bg-brand-hover disabled:opacity-dim inline-flex items-center gap-2 rounded-lg px-5 py-3 font-medium disabled:cursor-not-allowed"
        >
          {isExporting ? (
            <Loader2 aria-hidden className="size-4 animate-spin" />
          ) : (
            <Download aria-hidden className="size-4" />
          )}
          PDF 내보내기
        </button>
      </div>
    </header>
  )
}
