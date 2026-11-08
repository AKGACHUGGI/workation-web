import { describe, expect, it } from 'vitest'
import { parseReportPreset, parseYear, REPORT_YEAR } from '@/features/report/params'

describe('parseReportPreset', () => {
  it('quiet·lively 만 허용', () => {
    expect(parseReportPreset('quiet')).toBe('quiet')
    expect(parseReportPreset('lively')).toBe('lively')
  })
  it('custom·모르는 값·null 은 null (→ quiet 로 보정)', () => {
    expect(parseReportPreset('custom')).toBeNull()
    expect(parseReportPreset('party')).toBeNull()
    expect(parseReportPreset(null)).toBeNull()
  })
})

describe('parseYear', () => {
  it('2025 만 허용', () => {
    expect(parseYear('2025')).toBe(REPORT_YEAR)
    expect(parseYear('2024')).toBeNull()
    expect(parseYear('abc')).toBeNull()
    expect(parseYear(null)).toBeNull()
  })
})
