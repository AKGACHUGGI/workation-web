/** 데이터 범위. 백엔드 연결 후 메타 API 로 대체할 수 있게 한곳에 둔다. */
export const DATA_YEAR = 2025

const MM = ['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12'] as const
type MM = (typeof MM)[number]

export type MonthParam = `${typeof DATA_YEAR}-${MM}` | 'annual'

/** 연간 + 12개월. 월 칩 순서와 같다. */
export const MONTHS: readonly MonthParam[] = [
  'annual',
  ...MM.map((m) => `${DATA_YEAR}-${m}` as const),
]

export const DEFAULT_MONTH: MonthParam = `${DATA_YEAR}-12`

export function parseMonth(raw: string | null): MonthParam | null {
  if (raw === null) return null
  return (MONTHS as readonly string[]).includes(raw) ? (raw as MonthParam) : null
}

/** '2025-10' → '10월', 'annual' → '연간' */
export function monthLabel(month: MonthParam): string {
  const n = monthNumber(month)
  return n === null ? '연간' : `${n}월`
}

/** '2025-10' → 10, 'annual' → null */
export function monthNumber(month: MonthParam): number | null {
  if (month === 'annual') return null
  return Number(month.slice(5))
}
