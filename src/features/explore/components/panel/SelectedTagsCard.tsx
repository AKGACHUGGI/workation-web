import { Check, ChevronRight } from 'lucide-react'
import TagBars from '@/features/explore/components/panel/TagBars'
import { EXPLORE_COPY, GROUP_META, TAG_ICON, TAG_SHORT } from '@/features/explore/copy'
import { tagCount } from '@/features/explore/indexGraph'
import type { GraphIndex } from '@/features/explore/indexGraph'
import type { DongMatch } from '@/features/explore/match'
import type { TagSummary } from '@/features/explore/summary'

type Props = {
  index: GraphIndex
  tagIds: string[]
  /** 화면 안 하나라도 있는 동 수 */
  anyCount: number
  /** 화면 안 모두 있는 동 (장소 많은 순) */
  allMatches: DongMatch[]
  rows: TagSummary[]
  onToggle: (tagId: string) => void
  onOpenDong: (dongId: string) => void
}

const LIST_LIMIT = 4

/** ① 태그 선택 패널 (스펙 §3-2) */
export default function SelectedTagsCard({
  index,
  tagIds,
  anyCount,
  allMatches,
  rows,
  onToggle,
  onOpenDong,
}: Props) {
  const tags = index.res.tags.filter((t) => tagIds.includes(t.id))
  const labels = tags.map((t) => t.label).join(' + ')
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <h2 className="text-heading-lg text-text-primary">
          {EXPLORE_COPY.selectedTitle(tags.length)}
        </h2>
        <p className="text-caption-xs text-text-secondary">
          {EXPLORE_COPY.selectedSub(labels, anyCount)}
        </p>
      </div>
      <div className="bg-bg-subtle flex flex-col gap-4 rounded-xl p-4">
        <div className="flex flex-wrap gap-2">
          {tags.map((tag) => {
            const meta = GROUP_META[tag.group]
            const Icon = TAG_ICON[tag.id]
            return (
              <button
                key={tag.id}
                type="button"
                aria-label={`${tag.label} 선택 해제`}
                onClick={() => onToggle(tag.id)}
                style={{ borderColor: meta.color, background: meta.bg, color: meta.color }}
                className="text-body-sm inline-flex h-8 items-center gap-1 rounded-full border px-3 font-medium"
              >
                <Icon size={14} aria-hidden />
                {tag.label}
                <Check size={14} aria-hidden />
              </button>
            )
          })}
        </div>
        <p className="text-caption-xs text-text-secondary font-medium" id="explore-all-list">
          {EXPLORE_COPY.allListTitle}
        </p>
        {allMatches.length === 0 ? (
          <p className="text-body-sm text-text-tertiary">{EXPLORE_COPY.noAllMatch}</p>
        ) : (
          <ul aria-labelledby="explore-all-list" className="flex flex-col gap-1.5">
            {allMatches.slice(0, LIST_LIMIT).map((m) => {
              const dong = index.dongById.get(m.dongId)!
              const sgg = index.sigunguById.get(dong.sigunguId)
              return (
                <li key={m.dongId}>
                  <button
                    type="button"
                    onClick={() => onOpenDong(m.dongId)}
                    className="bg-bg-surface hover:shadow-float flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left"
                  >
                    <span data-name className="text-body-sm text-text-primary font-bold">
                      {dong.name}
                    </span>
                    <span className="text-caption-xs text-text-tertiary">{sgg?.name}</span>
                    <span className="ml-auto flex gap-2">
                      {m.matched.map((id) => {
                        const tag = index.tagById.get(id)!
                        if (tag.display === 'badge') return null
                        return (
                          <span
                            key={id}
                            className="text-caption-xs font-bold"
                            style={{ color: GROUP_META[tag.group].color }}
                          >
                            {TAG_SHORT[id]} {tagCount(dong, id)}
                          </span>
                        )
                      })}
                    </span>
                    <ChevronRight className="text-text-tertiary" size={14} aria-hidden />
                  </button>
                </li>
              )
            })}
          </ul>
        )}
      </div>
      <div className="flex flex-col gap-2">
        <div className="flex items-baseline justify-between">
          <h3 className="text-heading-lg text-text-primary">{EXPLORE_COPY.moreTags}</h3>
          <span className="text-caption-xs text-text-tertiary">{EXPLORE_COPY.barsCaption}</span>
        </div>
        <TagBars rows={rows} selected={tagIds} onToggle={onToggle} />
      </div>
    </div>
  )
}
