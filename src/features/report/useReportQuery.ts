import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { NotFoundError, UnauthorizedError } from '@/lib/errors'
import { fetchReport } from '@/features/report/api'
import { reportKeys } from '@/features/report/queryKeys'
import type { ReportPreset } from '@/features/report/types'

export function useReportQuery(id: string, params: { year: number; preset: ReportPreset }) {
  return useQuery({
    queryKey: reportKeys.detail(id, params),
    queryFn: () => fetchReport(id, params),
    placeholderData: keepPreviousData,
    // 404·401 은 다시 보내도 같은 결과 — 재시도 없이 에러 화면 / W-07 AuthProvider 세션 만료 처리로
    retry: (count, error) =>
      !(error instanceof NotFoundError || error instanceof UnauthorizedError) && count < 1,
  })
}
