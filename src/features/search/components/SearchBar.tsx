import { useState } from 'react'
import type { AnimationEvent, FormEvent } from 'react'
import { SEARCH_INPUT_ID } from '@/features/search/searchInput'

type Props = { initial: string; pending: boolean; onSubmit: (text: string) => void }

/** lucide Sparkles 와 같은 모양. 도형마다 시차를 줘 따로 반짝이게 한다 */
const SPARKLE_PARTS = [
  {
    d: 'M11.017 2.814a1 1 0 0 1 1.966 0l1.051 5.558a2 2 0 0 0 1.594 1.594l5.558 1.051a1 1 0 0 1 0 1.966l-5.558 1.051a2 2 0 0 0-1.594 1.594l-1.051 5.558a1 1 0 0 1-1.966 0l-1.051-5.558a2 2 0 0 0-1.594-1.594l-5.558-1.051a1 1 0 0 1 0-1.966l5.558-1.051a2 2 0 0 0 1.594-1.594z',
    delay: 0,
  },
  { d: 'M20 2v4M22 4h-4', delay: 180 },
  { d: 'M6 20a2 2 0 1 1-4 0a2 2 0 1 1 4 0', delay: 360 },
]

/** spinning 이면 계속, 아니면 검색창 포커스 순간 한 번 반짝인다 */
function SparkleGlyph({ spinning }: { spinning: boolean }) {
  const twinkle = spinning
    ? 'motion-safe:animate-sparkle-twinkle motion-safe:[animation-iteration-count:infinite]'
    : 'motion-safe:group-focus-within:animate-sparkle-twinkle'
  return (
    <svg
      width={24}
      height={24}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      className={`group-focus-within:text-brand-primary shrink-0 transition-colors ${
        spinning ? 'text-brand-primary' : 'text-text-primary'
      }`}
    >
      {SPARKLE_PARTS.map((part) => (
        <path
          key={part.d}
          d={part.d}
          className={`[transform-origin:center] [transform-box:fill-box] ${twinkle}`}
          style={{ animationDelay: `${part.delay}ms` }}
        />
      ))}
    </svg>
  )
}

/**
 * lucide Search 와 같은 모양(렌즈 r8 · 손잡이). spinning 동안 렌즈가 로딩 원처럼 그려지며 돈다.
 * 회전은 바퀴 단위로 끝나도록 SearchBar 가 animationiteration 에서 멈춘다.
 */
function SearchGlyph({ spinning }: { spinning: boolean }) {
  return (
    <svg
      width={20}
      height={20}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      className="relative"
    >
      <g
        style={{ transformOrigin: '11px 11px' }}
        className={spinning ? 'motion-safe:animate-lens-spin' : undefined}
      >
        <circle
          cx={11}
          cy={11}
          r={8}
          className={spinning ? 'motion-safe:animate-lens-draw' : undefined}
        />
      </g>
      <path d="m21 21-4.34-4.34" />
    </svg>
  )
}

/**
 * Figma SearchPill(51:207): 860×66 필 · ✧ 24 · 입력 16 · brand 오브 50 (이 화면의 유일한 CTA).
 * 포커스 순간 한 번 눌렸다 튕기고(✧ 반짝), 검색 중엔 오브가 레드 그대로 렌즈를 그리며 맥박 친다.
 */
export default function SearchBar({ initial, pending, onSubmit }: Props) {
  const [text, setText] = useState(initial)
  // 검색이 금방 끝나도 렌즈가 한 바퀴는 다 돌고 멈추게 붙잡아 둔다
  const [hold, setHold] = useState(false)
  const spinning = pending || hold
  const onLensAnim = (e: AnimationEvent) => {
    if (e.animationName !== 'lens-spin') return
    if (e.type === 'animationstart') setHold(true)
    else if (!pending) setHold(false)
  }
  const submit = (e: FormEvent) => {
    e.preventDefault()
    const t = text.trim()
    if (t) onSubmit(t)
  }
  return (
    <form
      role="search"
      onSubmit={submit}
      aria-busy={pending}
      className="group border-border-default bg-bg-surface shadow-float focus-within:border-brand-primary focus-within:ring-brand-soft motion-safe:focus-within:animate-search-pop flex h-16.5 w-215 items-center gap-4 rounded-full border pr-2 pl-6 transition-[border-color,box-shadow] duration-200 focus-within:ring-4"
    >
      <SparkleGlyph spinning={spinning} />
      <input
        id={SEARCH_INPUT_ID}
        type="search"
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="예: 11월에 조용한 해안 동네에서 일하고 싶어요"
        aria-label="워케이션 검색"
        className="text-body-base text-text-primary placeholder:text-text-tertiary flex-1 bg-transparent outline-none!"
      />
      <button
        type="submit"
        aria-label="검색"
        disabled={pending}
        onAnimationStart={onLensAnim}
        onAnimationIteration={onLensAnim}
        className="bg-brand-primary hover:bg-brand-hover text-text-inverse relative inline-flex size-12.5 shrink-0 items-center justify-center rounded-full transition-transform active:scale-90 disabled:cursor-progress"
      >
        {spinning && (
          <span
            aria-hidden
            className="bg-brand-primary motion-safe:animate-search-pulse absolute inset-0 rounded-full"
          />
        )}
        <SearchGlyph spinning={spinning} />
      </button>
    </form>
  )
}
