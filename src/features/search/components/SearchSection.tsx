import { useEffect, useRef, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import ExampleChips from '@/features/search/components/ExampleChips'
import IntentTags from '@/features/search/components/IntentTags'
import SearchBar from '@/features/search/components/SearchBar'
import { applyIntentToParams, removeIntentAxis } from '@/features/search/applyIntent'
import type { IntentAxis, SearchIntent } from '@/features/search/types'
import { useSearchParse } from '@/features/search/useSearchParse'

const NO_RESULT = '조건을 찾지 못했어요. 예시처럼 시기 · 분위기 · 동네를 적어보세요'
const CLEAR_KEYS = ['q', 'month', 'preset', 'metrics', 'terrain'] as const

/** 검색창 · 예시 칩 · AI가 이해한 조건 태그. URL q 가 있으면 진입 시 1회 파싱(URL 값 우선). */
export default function SearchSection() {
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

  return (
    <section className="flex flex-col gap-4">
      <div>
        <h1 className="text-heading-2xl text-text-primary">어떤 워케이션을 찾고 있나요?</h1>
        <p className="text-body-sm text-text-secondary mt-1">
          LG U+ 유동·서비스인구 데이터로 12개 시군구의 시기·동네 성격을 비교합니다.
        </p>
      </div>
      <SearchBar key={q} initial={q} pending={parse.isPending} onSubmit={(t) => run(t, true)} />
      <ExampleChips onPick={(t) => run(t, true)} />
      {intent && <IntentTags tags={intent.tags} onRemove={removeTag} onClear={clear} />}
      {noResult && <p className="text-body-sm text-text-secondary">{NO_RESULT}</p>}
    </section>
  )
}
