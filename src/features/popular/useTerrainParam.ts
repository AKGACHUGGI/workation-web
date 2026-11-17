import { useCallback, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import {
  parsePlace,
  parseTerrain,
  serializePlace,
  serializeTerrain,
} from '@/features/popular/params'
import type { PlaceTag, Terrain } from '@/features/popular/types'

/**
 * 쉼표 목록 쿼리 (복수). 빈 배열이면 키를 지운다 (기본값 "없음").
 * 무효 값은 replace 로 키 삭제.
 */
function useListParam<T>(
  key: string,
  parse: (raw: string | null) => T[] | null,
  serialize: (list: readonly T[]) => string,
): [T[], (next: T[]) => void] {
  const [searchParams, setSearchParams] = useSearchParams()
  const raw = searchParams.get(key)
  const parsed = parse(raw)
  const invalid = raw !== null && parsed === null
  const value = parsed ?? []

  useEffect(() => {
    if (!invalid) return
    setSearchParams(
      (prev) => {
        const next = new URLSearchParams(prev)
        next.delete(key)
        return next
      },
      { replace: true },
    )
  }, [invalid, key, setSearchParams])

  const set = useCallback(
    (next: T[]) => {
      setSearchParams((prev) => {
        const sp = new URLSearchParams(prev)
        if (next.length === 0) sp.delete(key)
        else sp.set(key, serialize(next))
        return sp
      })
    },
    [key, serialize, setSearchParams],
  )

  return [value, set]
}

/** terrain 쿼리: 해안 · 산간 · 도시 */
export function useTerrainParam(): [Terrain[], (next: Terrain[]) => void] {
  return useListParam('terrain', parseTerrain, serializeTerrain)
}

/** place 쿼리: 지형 외 장소 태그 (해수욕장 · 카페 많음 …) */
export function usePlaceParam(): [PlaceTag[], (next: PlaceTag[]) => void] {
  return useListParam('place', parsePlace, serializePlace)
}
