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

/** 데이터의 마지막 달. 연간 화면의 체감 투표 · 지도 탐색의 시군구 색처럼 달을 고르지 않는 곳이 쓴다. */
export const LATEST_MONTH: MonthParam = `${DATA_YEAR}-12`

/** 오늘. 테스트는 src/test/setup.ts 에서 이 함수를 고정한다. */
export function today(): Date {
  return new Date()
}

/** 달을 고르지 않았을 때의 기본 달 = 오늘 날짜의 달 (데이터 연도의 같은 달). 앱과 같은 규칙. */
export function defaultMonth(date: Date = today()): MonthParam {
  return `${DATA_YEAR}-${MM[date.getMonth()]}`
}

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
