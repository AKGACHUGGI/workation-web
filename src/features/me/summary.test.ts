import { describe, expect, it } from 'vitest'
import { buildActivitySummary, formatJoinedMonth } from '@/features/me/summary'
import { meSummaryMock } from '@/mocks/me/summary'

describe('formatJoinedMonth', () => {
  it('ISO → YYYY.MM', () => {
    expect(formatJoinedMonth('2025-03-14T09:00:00+09:00')).toBe('2025.03')
  })
})

describe('buildActivitySummary', () => {
  it('체류 · 팁 · 사진 · 가입', () => {
    expect(buildActivitySummary(meSummaryMock)).toBe(
      '강릉 2회 · 고성 1회 체류 · 팁 7개 · 사진 12장 · 2025.03 가입',
    )
  })
  it('체류 기록이 없으면 안내 문구', () => {
    expect(buildActivitySummary({ ...meSummaryMock, stays: [] })).toBe(
      '아직 체류 기록 없음 · 팁 7개 · 사진 12장 · 2025.03 가입',
    )
  })
})
