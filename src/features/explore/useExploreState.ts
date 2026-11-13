import { useCallback, useEffect, useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import { usePinsQuery } from '@/features/explore/usePinsQuery'
import { NotFoundError } from '@/lib/errors'

export type ExploreState = {
  sgg: string | null
  dong: string | null
  /** ⓪ → ① (또는 다른 시군구). dong 은 지운다 */
  openSigungu: (id: string) => void
  /** ② 열기. 다른 시군구의 동(비슷한 동)이면 sgg 도 넘긴다 */
  openDong: (id: string, sgg?: string) => void
  /** ② → ① (시군구 유지) */
  backToSigungu: () => void
  /** ⓪ 으로 */
  closeAll: () => void
}

/**
 * 스펙 §5 보정 규칙. 고칠 게 없으면 null.
 * - sgg 없는 dong → dong 삭제
 * - 없는 시군구(핀 404) → sgg·dong 삭제
 * - 핀을 받았는데 그 시군구에 없는 dong → dong 삭제
 */
export function sanitizeExploreParams(
  params: URLSearchParams,
  check: { sggMissing?: boolean; dongIds?: ReadonlySet<string> } = {},
): URLSearchParams | null {
  const next = new URLSearchParams(params)
  const sgg = params.get('sgg') || null
  const dong = params.get('dong') || null
  if (params.has('sgg') && !sgg) next.delete('sgg')
  if (params.has('dong') && !dong) next.delete('dong')
  if (!sgg || check.sggMissing) {
    next.delete('sgg')
    next.delete('dong')
  } else if (dong && check.dongIds && !check.dongIds.has(dong)) {
    next.delete('dong')
  }
  return next.toString() === params.toString() ? null : next
}

/** /explore URL 상태 (sgg·dong). 핀 쿼리로 id 를 확인해 보정한다 (같은 쿼리 키라 요청은 한 번) */
export function useExploreState(): ExploreState {
  const [params, setParams] = useSearchParams()
  const pins = usePinsQuery(params.get('sgg') || null)
  const sggMissing = pins.error instanceof NotFoundError
  const dongIds = useMemo(
    () => (pins.data ? new Set(pins.data.dongs.map((d) => d.id)) : undefined),
    [pins.data],
  )
  const fixed = useMemo(
    () => sanitizeExploreParams(params, { sggMissing, dongIds }),
    [params, sggMissing, dongIds],
  )

  useEffect(() => {
    if (fixed) setParams(fixed, { replace: true })
  }, [fixed, setParams])

  const effective = fixed ?? params
  const sgg = effective.get('sgg')
  const dong = effective.get('dong')

  const push = useCallback(
    (edit: (next: URLSearchParams) => void) =>
      setParams((prev) => {
        const next = new URLSearchParams(prev)
        edit(next)
        return next
      }),
    [setParams],
  )

  const openSigungu = useCallback(
    (id: string) =>
      push((p) => {
        p.set('sgg', id)
        p.delete('dong')
      }),
    [push],
  )
  const openDong = useCallback(
    (id: string, sggId?: string) =>
      push((p) => {
        if (sggId) p.set('sgg', sggId)
        p.set('dong', id)
      }),
    [push],
  )
  const backToSigungu = useCallback(() => push((p) => p.delete('dong')), [push])
  const closeAll = useCallback(
    () =>
      push((p) => {
        p.delete('sgg')
        p.delete('dong')
      }),
    [push],
  )

  return { sgg, dong, openSigungu, openDong, backToSigungu, closeAll }
}
