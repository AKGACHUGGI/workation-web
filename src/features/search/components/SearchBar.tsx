import { useState } from 'react'
import type { FormEvent } from 'react'
import { Search, Sparkles } from 'lucide-react'
import { SEARCH_INPUT_ID } from '@/features/search/searchInput'

type Props = { initial: string; pending: boolean; onSubmit: (text: string) => void }

/** Figma SearchPill(51:207): 860×66 필 · ✧ 24 · 입력 16 · brand 오브 50 (이 화면의 유일한 CTA) */
export default function SearchBar({ initial, pending, onSubmit }: Props) {
  const [text, setText] = useState(initial)
  const submit = (e: FormEvent) => {
    e.preventDefault()
    const t = text.trim()
    if (t) onSubmit(t)
  }
  return (
    <form
      role="search"
      onSubmit={submit}
      className="border-border-default bg-bg-surface shadow-float flex h-16.5 w-215 items-center gap-4 rounded-full border pr-2 pl-6"
    >
      <Sparkles size={24} aria-hidden className="text-text-primary shrink-0" />
      <input
        id={SEARCH_INPUT_ID}
        type="search"
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="예: 11월에 조용한 해안 동네에서 일하고 싶어요"
        aria-label="워케이션 검색"
        className="text-body-base text-text-primary placeholder:text-text-tertiary flex-1 bg-transparent outline-none"
      />
      <button
        type="submit"
        aria-label="검색"
        disabled={pending}
        className="bg-brand-primary hover:bg-brand-hover text-text-inverse disabled:opacity-dim inline-flex size-12.5 shrink-0 items-center justify-center rounded-full"
      >
        <Search size={20} aria-hidden />
      </button>
    </form>
  )
}
