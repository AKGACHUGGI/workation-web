import type { ReportPreset, ReportResponse } from '@/features/report/types'
import { goseongQuiet } from '@/mocks/report/51820'
import { makeReportMock } from '@/mocks/report/generate'

/** 없는 id 면 null (API 가 NotFoundError 로 바꾼다) */
export function getReportMock(id: string, preset: ReportPreset): ReportResponse | null {
  if (id === '51820' && preset === 'quiet') return goseongQuiet
  return makeReportMock(id, preset)
}
