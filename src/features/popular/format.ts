/** 소수 1자리 버림, '.0' 생략 */
function trim1(v: number): string {
  const t = Math.floor(v * 10) / 10
  return Number.isInteger(t) ? String(t) : t.toFixed(1)
}

/** 1,000 미만 그대로 · 1,000 이상 'X.Y천' · 10,000 이상 'X.Y만' */
export function formatCount(n: number): string {
  if (n < 1000) return n.toLocaleString('ko-KR')
  if (n < 10000) return `${trim1(n / 1000)}천`
  return `${trim1(n / 10000)}만`
}
