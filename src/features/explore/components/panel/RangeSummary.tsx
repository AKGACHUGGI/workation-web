import { MousePointerClick } from 'lucide-react'
import TagBars from '@/features/explore/components/panel/TagBars'
import { EXPLORE_COPY } from '@/features/explore/copy'
import type { TagSummary } from '@/features/explore/summary'

type Props = { rows: TagSummary[]; selected: string[]; onToggle: (tagId: string) => void }

/** ⓪ 기본 상태 패널 (스펙 §3-1) */
export default function RangeSummary({ rows, selected, onToggle }: Props) {
  return (
    <div className="flex flex-col gap-6">
      <h2 className="text-heading-lg text-text-primary">{EXPLORE_COPY.rangeTitle}</h2>
      <div className="bg-bg-subtle flex gap-3 rounded-xl p-4">
        <MousePointerClick className="text-text-secondary shrink-0" size={20} aria-hidden />
        <div className="flex flex-col gap-1">
          <p className="text-body-sm text-text-primary font-bold">{EXPLORE_COPY.pickHint}</p>
          <p className="text-caption-xs text-text-secondary">{EXPLORE_COPY.pickHintSub}</p>
        </div>
      </div>
      <div className="flex flex-col gap-2">
        <p className="text-caption-xs text-text-tertiary">{EXPLORE_COPY.barsCaption}</p>
        <TagBars rows={rows} selected={selected} onToggle={onToggle} />
      </div>
    </div>
  )
}
