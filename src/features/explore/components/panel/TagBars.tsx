import { EXPLORE_COPY, GROUP_META, GROUP_ORDER, TAG_ICON } from '@/features/explore/copy'
import type { TagSummary } from '@/features/explore/summary'

type Props = { rows: TagSummary[]; selected: string[]; onToggle: (tagId: string) => void }

/** 묶음별 태그 막대 (⓪ 범위 요약, ① 태그 더 고르기). 행을 누르면 태그 바와 같이 선택된다 */
export default function TagBars({ rows, selected, onToggle }: Props) {
  const max = Math.max(1, ...rows.map((r) => r.count))
  return (
    <div className="flex flex-col gap-4">
      {GROUP_ORDER.map((group) => {
        const list = rows.filter((r) => r.tag.group === group)
        if (list.length === 0) return null
        const meta = GROUP_META[group]
        const GroupIcon = TAG_ICON[list[0].tag.id]
        return (
          <section key={group} className="flex flex-col gap-1">
            <h3
              className="text-caption-xs flex items-center gap-1 font-bold"
              style={{ color: meta.color }}
            >
              <GroupIcon size={12} aria-hidden />
              {meta.label}
            </h3>
            {list.map(({ tag, count }) => {
              const on = selected.includes(tag.id)
              return (
                <button
                  key={tag.id}
                  type="button"
                  aria-pressed={on}
                  onClick={() => onToggle(tag.id)}
                  style={on ? { background: meta.bg } : undefined}
                  className="text-body-sm text-text-primary hover:bg-bg-subtle flex items-center gap-3 rounded-md px-2 py-1.5 text-left"
                >
                  <span className="w-20 shrink-0">{tag.label}</span>
                  <span aria-hidden className="bg-bg-surface-strong h-1.5 flex-1 rounded-full">
                    <span
                      className="block h-full rounded-full"
                      style={{ width: `${(count / max) * 100}%`, background: meta.color }}
                    />
                  </span>
                  <span className="text-caption-xs text-text-secondary w-10 shrink-0 text-right">
                    {EXPLORE_COPY.barCount(count)}
                  </span>
                </button>
              )
            })}
          </section>
        )
      })}
    </div>
  )
}
