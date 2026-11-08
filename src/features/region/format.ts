/** [2, 3] → '2 · 3월'. 빈 배열은 '—' */
export function formatMonths(months: number[]): string {
  if (months.length === 0) return '—'
  return `${months.join(' · ')}월`
}
