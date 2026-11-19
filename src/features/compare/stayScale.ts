/** 체류 곡선 세로축 최대값 후보 (× 10^k). 4등분 눈금이 깔끔한 수만 둔다 */
const NICE = [1, 2, 4, 6, 8, 10]

/** 비교 열들이 함께 쓸 세로축 최대값: 가장 큰 체류인구 이상인 깔끔한 수. 값이 없으면 null */
export function stayAxisMax(values: number[]): number | null {
  const max = Math.max(0, ...values)
  if (max === 0) return null
  const mag = 10 ** Math.floor(Math.log10(max))
  const n = NICE.find((c) => c * mag >= max) ?? 10
  return n * mag
}

/** 0 · ¼ · ½ · ¾ · 최대 */
export function stayTicks(max: number): number[] {
  return [0, 1, 2, 3, 4].map((i) => (max * i) / 4)
}

/** 12000 → '1.2만', 4500 → '4,500' */
export function formatPeople(v: number): string {
  if (v >= 10000) return `${Math.round(v / 1000) / 10}만`
  return Math.round(v).toLocaleString('ko-KR')
}
