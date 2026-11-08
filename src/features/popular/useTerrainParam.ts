import { useCallback, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { parseTerrain, serializeTerrain } from '@/features/popular/params'
import type { Terrain } from '@/features/popular/types'

/**
 * terrain 쿼리 (복수). 빈 배열이면 키를 지운다 (기본값 "없음").
 * 무효 값은 replace 로 키 삭제.
 */
export function useTerrainParam(): [Terrain[], (next: Terrain[]) => void] {
  const [searchParams, setSearchParams] = useSearchParams()
  const raw = searchParams.get('terrain')
  const parsed = parseTerrain(raw)
  const invalid = raw !== null && parsed === null
  const value = parsed ?? []

  useEffect(() => {
    if (!invalid) return
    setSearchParams(
      (prev) => {
        const next = new URLSearchParams(prev)
        next.delete('terrain')
        return next
      },
      { replace: true },
    )
  }, [invalid, setSearchParams])

  const set = useCallback(
    (next: Terrain[]) => {
      setSearchParams((prev) => {
        const sp = new URLSearchParams(prev)
        if (next.length === 0) sp.delete('terrain')
        else sp.set('terrain', serializeTerrain(next))
        return sp
      })
    },
    [setSearchParams],
  )

  return [value, set]
}
