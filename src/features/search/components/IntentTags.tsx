import { X } from 'lucide-react'
import type { IntentAxis } from '@/features/search/types'

type Props = {
  tags: { axis: IntentAxis; label: string }[]
  onRemove: (axis: IntentAxis, label: string) => void
  onClear: () => void
}

/** "AI가 이해한 조건" 태그 줄 */
export default function IntentTags({ tags, onRemove, onClear }: Props) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-caption-xs text-text-secondary">AI가 이해한 조건</span>
      {tags.map((t) => (
        <span
          key={`${t.axis}-${t.label}`}
          className="bg-selected-bg text-selected-fg text-caption-segment inline-flex h-7 items-center gap-1 rounded-full pr-1 pl-3"
        >
          {t.label}
          <button
            type="button"
            aria-label={`${t.label} 삭제`}
            onClick={() => onRemove(t.axis, t.label)}
            className="inline-flex h-5 w-5 items-center justify-center rounded-full"
          >
            <X size={12} aria-hidden />
          </button>
        </span>
      ))}
      <button
        type="button"
        onClick={onClear}
        className="text-caption-xs text-text-tertiary underline"
      >
        조건 지우기
      </button>
    </div>
  )
}
