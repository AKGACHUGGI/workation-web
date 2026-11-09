import { Fragment, useRef } from 'react'
import { Check, ChevronRight } from 'lucide-react'
import { EXPLORE_COPY, GROUP_META, GROUP_ORDER, TAG_ICON } from '@/features/explore/copy'
import type { ExploreTag } from '@/features/explore/types'

type Props = {
  tags: ExploreTag[]
  selected: string[]
  onToggle: (tagId: string) => void
  /** 로딩 중: 흐리게 + 비활성 (스펙 §9) */
  disabled?: boolean
}

/** 지도 상단 태그 바 (스펙 §3-0). 묶음 색·아이콘 칩, 묶음 사이 구분선, 오른쪽 흐림 + 스크롤 버튼 */
export default function TagBar({ tags, selected, onToggle, disabled = false }: Props) {
  const scroller = useRef<HTMLDivElement>(null)
  const groups = GROUP_ORDER.map((g) => tags.filter((t) => t.group === g)).filter(
    (l) => l.length > 0,
  )

  return (
    <div
      role="toolbar"
      aria-label={EXPLORE_COPY.tagBarLabel}
      className={`bg-bg-surface shadow-float flex items-center gap-2 rounded-full py-1.5 pr-1.5 pl-4 ${disabled ? 'opacity-dim' : ''}`}
    >
      <span className="text-caption-xs text-text-secondary shrink-0 font-medium">
        {EXPLORE_COPY.tagBarLabel}
      </span>
      <div className="relative min-w-0 flex-1">
        <div ref={scroller} className="flex items-center gap-1.5 overflow-x-auto">
          {groups.map((list, gi) => (
            <Fragment key={list[0].group}>
              {gi > 0 && (
                <span data-divider aria-hidden className="bg-border-default h-5 w-px shrink-0" />
              )}
              {list.map((tag) => {
                const on = selected.includes(tag.id)
                const meta = GROUP_META[tag.group]
                const Icon = TAG_ICON[tag.id]
                return (
                  <button
                    key={tag.id}
                    type="button"
                    aria-pressed={on}
                    disabled={disabled}
                    onClick={() => onToggle(tag.id)}
                    style={
                      on
                        ? { borderColor: meta.color, background: meta.bg, color: meta.color }
                        : undefined
                    }
                    className="text-body-sm border-border-default text-text-primary hover:border-border-strong inline-flex h-8 shrink-0 cursor-pointer items-center gap-1 rounded-full border px-3 font-medium whitespace-nowrap disabled:cursor-not-allowed"
                  >
                    {Icon && (
                      <Icon size={14} aria-hidden color={on ? 'currentColor' : meta.color} />
                    )}
                    {tag.label}
                    {on && <Check size={14} aria-hidden />}
                  </button>
                )
              })}
            </Fragment>
          ))}
        </div>
        <span
          aria-hidden
          className="from-bg-surface pointer-events-none absolute inset-y-0 right-0 w-10 bg-linear-to-l to-transparent"
        />
      </div>
      <button
        type="button"
        aria-label={EXPLORE_COPY.tagScroll}
        disabled={disabled}
        onClick={() => scroller.current?.scrollBy?.({ left: 240, behavior: 'smooth' })}
        className="border-border-default text-text-primary inline-flex size-8 shrink-0 items-center justify-center rounded-full border"
      >
        <ChevronRight size={16} aria-hidden />
      </button>
    </div>
  )
}
