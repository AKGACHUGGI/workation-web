import { useEffect, useRef, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { applyIntentToParams, removeIntentAxis } from '@/features/search/applyIntent'
import type { IntentAxis, SearchIntent } from '@/features/search/types'
import { useSearchParse } from '@/features/search/useSearchParse'

const CLEAR_KEYS = ['q', 'month', 'preset', 'metrics', 'terrain'] as const

/**
 * 자연어 검색 상태. 검색창(히어로)과 "AI가 이해한 조건" 줄(결과 머리, Figma 274:4778)이 서로 떨어져 있어
 * HomePage 가 이 훅을 들고 두 곳에 나눠 준다. URL q 가 있으면 진입 시 1회 파싱(URL 값 우선).
 */
export function useSearchIntent() {
  const [searchParams, setSearchParams] = useSearchParams()
  const q = searchParams.get('q') ?? ''
  const parse = useSearchParse()
  const [intent, setIntent] = useState<SearchIntent | null>(null)
  const [noResult, setNoResult] = useState(false)
  const parsedOnEntry = useRef(false)

  const run = (text: string, override: boolean) => {
    parse.mutate(text, {
      onSuccess: (result) => {
        setIntent(result.tags.length ? result : null)
        setNoResult(result.tags.length === 0)
        setSearchParams((prev) => {
          const next = applyIntentToParams(result, prev, { override })
          next.set('q', text)
          return next
        })
      },
    })
  }

  useEffect(() => {
    if (parsedOnEntry.current || !q) return
    parsedOnEntry.current = true
    run(q, false)
    // 진입 시 1회만 (q 가 바뀔 때마다 다시 파싱하지 않는다)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const removeTag = (axis: IntentAxis, label: string) => {
    setSearchParams((prev) => removeIntentAxis(axis, prev))
    setIntent((cur) => {
      if (!cur) return cur
      const tags = cur.tags.filter((t) => !(t.axis === axis && t.label === label))
      return tags.length ? { ...cur, tags } : null
    })
  }

  const clear = () => {
    setIntent(null)
    setNoResult(false)
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev)
      for (const k of CLEAR_KEYS) next.delete(k)
      return next
    })
  }

  return {
    q,
    intent,
    noResult,
    pending: parse.isPending,
    /** 사용자가 입력·예시로 검색 (URL 값을 덮어쓴다) */
    submit: (text: string) => run(text, true),
    removeTag,
    clear,
  }
}

export type SearchIntentState = ReturnType<typeof useSearchIntent>
