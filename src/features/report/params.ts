import type { ReportPreset } from '@/features/report/types'

/** 데이터 1년치. 향후 연도 확장 시 배열로 바꾼다. */
export const REPORT_YEAR = 2025
export const DEFAULT_REPORT_PRESET: ReportPreset = 'quiet'

/** 'custom' 은 지원하지 않으므로 null → useQueryState 가 quiet 로 보정(replace) */
export function parseReportPreset(raw: string | null): ReportPreset | null {
  return raw === 'quiet' || raw === 'lively' ? raw : null
}

export function parseYear(raw: string | null): number | null {
  return raw !== null && Number(raw) === REPORT_YEAR ? REPORT_YEAR : null
}
