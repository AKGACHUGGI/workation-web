import { useCallback, useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { MAX_COMPARE, parseDongsParam } from '@/features/compare/params'
import { readStoredDongs, writeStoredDongs } from '@/features/compare/storage'

const KEY = 'dongs'

/**
 * 비교 목록. URL `dongs` 가 진실, localStorage 는 복원·백업.
 * validIds: tier dong 응답의 id 목록 (메모이즈해서 넘길 것). 없으면 검증 생략.
 */
export function useCompareList(validIds?: readonly string[]) {
  const [searchParams, setSearchParams] = useSearchParams()
  const raw = searchParams.get(KEY)

  const validSet = useMemo(() => (validIds ? new Set(validIds) : undefined), [validIds])
  const { ids, dropped } = useMemo(() => parseDongsParam(raw, validSet), [raw, validSet])
  const serialized = ids.join(',')
  // 보정 후 다시 파싱하면 dropped 가 비므로, 보정할 때 제외한 id 를 따로 기억해 돌려준다
  const [reported, setReported] = useState<string[]>([])
  if (dropped.length > 0 && dropped.join(',') !== reported.join(',')) setReported(dropped)

  const write = useCallback(
    (next: string[], replace: boolean) => {
      setSearchParams(
        (prev) => {
          const sp = new URLSearchParams(prev)
          if (next.length === 0) sp.delete(KEY)
          else sp.set(KEY, next.join(','))
          return sp
        },
        { replace },
      )
    },
    [setSearchParams],
  )

  // 1) 쿼리 없음 → 마지막 목록 복원 (replace)
  useEffect(() => {
    if (raw !== null) return
    const stored = readStoredDongs()
    if (stored.length > 0) write(stored, true)
  }, [raw, write])

  // 2) 파싱 결과가 raw 와 다르면(중복·초과·무효) URL 보정 (replace)
  useEffect(() => {
    if (raw === null || raw === serialized) return
    write(ids, true)
  }, [raw, serialized, ids, write])

  // 3) 목록이 바뀌면 storage 갱신 (URL 변경 후)
  useEffect(() => {
    if (raw !== null) writeStoredDongs(ids)
  }, [raw, ids])

  const canAdd = ids.length < MAX_COMPARE

  const add = useCallback(
    (id: string) => {
      if (!canAdd || ids.includes(id)) return
      write([...ids, id], false)
    },
    [canAdd, ids, write],
  )

  const remove = useCallback(
    (id: string) => {
      const next = ids.filter((v) => v !== id)
      if (next.length === 0) writeStoredDongs([]) // 복원 효과가 되살리지 않도록 먼저 비운다
      write(next, false)
    },
    [ids, write],
  )

  return { ids, add, remove, canAdd, dropped: reported }
}
