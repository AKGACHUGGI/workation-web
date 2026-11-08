/** 페이지 이동 시 유지하는 공유 쿼리. metrics 는 preset=custom 일 때만. */
export const SHARED_QUERY_KEYS = ['month', 'preset', 'metrics'] as const

/** `to` 경로에 현재 URL 의 공유 쿼리를 붙인다. to 에 이미 있는 키는 유지한다. */
export function carryQuery(to: string, current: URLSearchParams): string {
  const [path, search = ''] = to.split('?')
  const next = new URLSearchParams(search)
  const isCustom = current.get('preset') === 'custom'
  for (const key of SHARED_QUERY_KEYS) {
    if (next.has(key)) continue
    if (key === 'metrics' && !isCustom) continue
    const v = current.get(key)
    if (v !== null) next.set(key, v)
  }
  const qs = next.toString()
  return qs ? `${path}?${qs}` : path
}
