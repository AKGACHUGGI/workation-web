import { api, apiBlob } from '@/lib/api'
import { NotFoundError } from '@/lib/errors'
import { isMock, mockDelay } from '@/lib/mock'
import type { ReportPreset, ReportResponse } from '@/features/report/types'
import { getReportMock } from '@/mocks/report'

type Params = { year: number; preset: ReportPreset }

const PDF_TIMEOUT_MS = 30_000

function qs({ year, preset }: Params): string {
  return `?year=${year}&preset=${preset}`
}

/** GET /api/reports/{sggId}?year=&preset= */
export async function fetchReport(id: string, params: Params): Promise<ReportResponse> {
  if (isMock) {
    const data = getReportMock(id, params.preset)
    if (!data) throw new NotFoundError(`/api/reports/${id}`)
    return mockDelay(data)
  }
  return api<ReportResponse>(`/api/reports/${id}${qs(params)}`)
}

/** GET /api/reports/{sggId}/pdf — application/pdf. 생성에 수 초 걸릴 수 있어 30초 타임아웃 */
export async function fetchReportPdf(id: string, params: Params): Promise<Blob> {
  if (isMock) {
    // mock 은 정적 샘플 파일. 백엔드 주소가 아니라 같은 origin 의 public/ 이므로 apiBlob 을 거치지 않는다.
    const res = await fetch('/mock-pdf/sample.pdf')
    if (!res.ok) throw new Error('sample.pdf not found')
    return res.blob()
  }
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), PDF_TIMEOUT_MS)
  try {
    return await apiBlob(`/api/reports/${id}/pdf${qs(params)}`, { signal: controller.signal })
  } finally {
    clearTimeout(timer)
  }
}
