import { useParams } from 'react-router-dom'
import PageContainer from '@/components/layout/PageContainer'
import AnnualCrowdChart from '@/features/report/components/AnnualCrowdChart'
import DiagnosisSection from '@/features/report/components/DiagnosisSection'
import RankingTable from '@/features/report/components/RankingTable'
import ReportHeader from '@/features/report/components/ReportHeader'
import ReportSkeleton from '@/features/report/components/ReportSkeleton'
import SummaryCards from '@/features/report/components/SummaryCards'
import { REPORT_SOURCE_NOTE } from '@/features/report/copy'
import {
  DEFAULT_REPORT_PRESET,
  parseReportPreset,
  parseYear,
  REPORT_YEAR,
} from '@/features/report/params'
import { useReportPdf } from '@/features/report/useReportPdf'
import { useReportQuery } from '@/features/report/useReportQuery'
import { useQueryState } from '@/hooks/useQueryState'
import { NotFoundError } from '@/lib/errors'

/** W-06 지자체 진단 리포트. /reports/:sggId?preset=quiet|lively&year=2025 */
export default function ReportPage() {
  const { sggId = '' } = useParams()
  const [preset] = useQueryState('preset', parseReportPreset, DEFAULT_REPORT_PRESET)
  const [year] = useQueryState('year', parseYear, REPORT_YEAR)
  const query = useReportQuery(sggId, { year, preset })
  const pdf = useReportPdf(sggId, { year, preset, name: query.data?.name ?? '' })

  // 없는 sggId → 라우트의 errorElement(NotFoundPage) 가 레이아웃 안에서 받는다
  if (query.isError && query.error instanceof NotFoundError) throw query.error

  return (
    <PageContainer className="flex flex-col gap-6 py-10">
      <ReportHeader
        currentId={sggId}
        onExportPdf={pdf.download}
        isExporting={pdf.isPending || !query.data}
      />

      {query.isPending && <ReportSkeleton />}

      {query.isError && (
        <div
          role="alert"
          className="border-border-default flex flex-col items-center gap-3 rounded-xl border p-10"
        >
          <p className="text-body-base text-text-primary">리포트를 불러오지 못했습니다</p>
          <button
            type="button"
            onClick={() => query.refetch()}
            className="border-border-default text-body-sm text-text-primary hover:border-border-strong rounded-lg border px-4 py-2"
          >
            다시 시도
          </button>
        </div>
      )}

      {query.data && (
        <div className={`flex flex-col gap-6 ${query.isPlaceholderData ? 'opacity-dim' : ''}`}>
          <SummaryCards report={query.data} />
          <div className="grid grid-cols-5 gap-6">
            <div className="col-span-3">
              <AnnualCrowdChart
                months={query.data.months}
                topMonths={query.data.peakConcentration.topMonths}
                narrative={query.data.seasonNarrative}
              />
            </div>
            <div className="col-span-2">
              <RankingTable
                items={query.data.ranking.items}
                currentId={query.data.id}
                preset={preset}
              />
            </div>
          </div>
          <DiagnosisSection diagnosis={query.data.diagnosis} />
          <p className="text-caption-xs text-text-tertiary">{REPORT_SOURCE_NOTE}</p>
        </div>
      )}
    </PageContainer>
  )
}
