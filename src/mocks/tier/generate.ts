import { monthNumber } from '@/features/metric/month'
import type { MonthParam } from '@/features/metric/month'
import type { MetricKey } from '@/features/metric/types'
import type { TierItem } from '@/features/tier/types'

/** 문자열 → 32비트 부호 없는 정수 (결정적) */
export function hashStr(s: string): number {
  let h = 0
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0
  return h
}

/** 값 배열 → 백분위(0~100 정수). 자기보다 작은 값의 비율. 1개면 50 */
export function toPercentiles(values: number[]): number[] {
  const n = values.length
  if (n < 2) return values.map(() => 50)
  return values.map((v) => Math.round((100 * values.filter((x) => x < v).length) / (n - 1)))
}

/** -20 ~ +20 결정적 흔들림. annual 은 m = 0 */
function offset(id: string, key: MetricKey, m: number): number {
  return ((hashStr(`${id}:${key}`) + m * 37) % 41) - 20
}

/**
 * 10월 픽스처에서 다른 달(또는 연간)을 만든다. scripts/gen-mock.py 결과(generated/)가 없을 때 쓰는 대체물.
 * quiet·crowd·peer·vibe 는 흔든 뒤 같은 집합 안에서 다시 백분위로 바꾸고, overnight 는 연중 상수라 그대로 둔다.
 */
export function deriveMonth(base: TierItem[], month: MonthParam): TierItem[] {
  if (month === '2025-10') return base
  const m = monthNumber(month) ?? 0
  const column = (key: MetricKey) =>
    toPercentiles(base.map((it) => it.scores[key] + offset(it.id, key, m)))
  const quiet = column('quiet')
  const crowd = column('crowd')
  const peer = column('peer')
  const vibe = column('vibe')
  return base.map((it, i) => ({
    ...it,
    scores: {
      quiet: quiet[i],
      crowd: crowd[i],
      peer: peer[i],
      overnight: it.scores.overnight,
      vibe: vibe[i],
    },
  }))
}
