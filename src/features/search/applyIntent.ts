import { serializeTerrain } from '@/features/popular/params'
import type { IntentAxis, SearchIntent } from '@/features/search/types'

/** URL 에 반영하는 축 → 쿼리 키 */
const AXIS_KEY: Partial<Record<IntentAxis, string>> = {
  month: 'month',
  preset: 'preset',
  terrain: 'terrain',
}

/**
 * 파싱 결과를 URL 쿼리에 반영한다. month·preset·terrain 만 (stay·peer 는 태그 표시 전용).
 * override=false(기본): 이미 있는 키는 유지 (진입 시 q 파싱). override=true: 덮어쓴다 (검색 실행).
 */
export function applyIntentToParams(
  intent: SearchIntent,
  current: URLSearchParams,
  opts: { override?: boolean } = {},
): URLSearchParams {
  const next = new URLSearchParams(current)
  const put = (key: string, value: string) => {
    if (!opts.override && next.has(key)) return
    next.set(key, value)
  }
  if (intent.month) put('month', intent.month)
  if (intent.preset) put('preset', intent.preset)
  if (intent.terrain && intent.terrain.length > 0) put('terrain', serializeTerrain(intent.terrain))
  if (next.get('preset') !== 'custom') next.delete('metrics')
  return next
}

/** 조건 태그 × 클릭: 해당 축의 쿼리 키 삭제 */
export function removeIntentAxis(axis: IntentAxis, current: URLSearchParams): URLSearchParams {
  const next = new URLSearchParams(current)
  const key = AXIS_KEY[axis]
  if (key) next.delete(key)
  if (key === 'preset') next.delete('metrics')
  return next
}
