import { useCallback, useEffect, useRef } from 'react'
import { useSearchParams } from 'react-router-dom'
import { DEFAULT_MONTH, parseMonth } from '@/features/metric/month'
import type { MonthParam } from '@/features/metric/month'
import { DEFAULT_PRESET, parsePreset } from '@/features/metric/params'
import type { PresetKey } from '@/features/metric/types'

export type SetQueryState<T> = (value: T, opts?: { replace?: boolean }) => void

/**
 * URL 쿼리 하나를 상태처럼 쓴다.
 * - 키가 없으면 defaultValue (URL 은 그대로)
 * - 파싱 실패(null)면 defaultValue 로 바꾸고 replace 로 URL 보정 (뒤로가기 기록 없음)
 * - setter 는 push 가 기본, 슬라이더처럼 연속 변경은 { replace: true }
 */
export function useQueryState<T>(
  key: string,
  parse: (raw: string | null) => T | null,
  defaultValue: T,
  serialize: (v: T) => string = String,
): [T, SetQueryState<T>] {
  const [searchParams, setSearchParams] = useSearchParams()
  const serializeRef = useRef(serialize)
  serializeRef.current = serialize

  const raw = searchParams.get(key)
  const parsed = raw === null ? null : parse(raw)
  const invalid = raw !== null && parsed === null
  const value = parsed ?? defaultValue

  useEffect(() => {
    if (!invalid) return
    setSearchParams(
      (prev) => {
        const next = new URLSearchParams(prev)
        next.set(key, serializeRef.current(defaultValue))
        return next
      },
      { replace: true },
    )
    // searchParams 를 의존성에 둬서, 같은 커밋의 다른 보정이 이 보정을 덮어써도 다음 렌더에서 다시 고친다
  }, [invalid, key, defaultValue, searchParams, setSearchParams])

  const set = useCallback<SetQueryState<T>>(
    (v, opts) => {
      setSearchParams(
        (prev) => {
          const next = new URLSearchParams(prev)
          next.set(key, serializeRef.current(v))
          return next
        },
        { replace: opts?.replace ?? false },
      )
    },
    [key, setSearchParams],
  )

  return [value, set]
}

/** 공통 키 month */
export function useMonthParam(): [MonthParam, SetQueryState<MonthParam>] {
  return useQueryState<MonthParam>('month', parseMonth, DEFAULT_MONTH)
}

/** 공통 키 preset */
export function usePresetParam(): [PresetKey, SetQueryState<PresetKey>] {
  return useQueryState<PresetKey>('preset', parsePreset, DEFAULT_PRESET)
}
