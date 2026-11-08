import { X } from 'lucide-react'
import type { IntentAxis } from '@/features/search/types'

type Props = {
  tags: { axis: IntentAxis; label: string }[]
  onRemove: (axis: IntentAxis, label: string) => void
  onClear: () => void
  /** "조건 수정": 검색창으로 돌아가 문장을 고친다 */
  onEdit: () => void
}

/**
 * Figma ParsedConditions(274:4778): "AI가 이해한 조건" 14 보조색 + 중립 Tag 들 + "조건 수정" 밑줄 링크.
 * 기존 기능(태그별 삭제 ×, 조건 지우기)은 유지한다.
 */
export default function IntentTags({ tags, onRemove, onClear, onEdit }: Props) {
  return (
    <div className="flex flex-wrap items-center gap-1.5">
      <span className="text-body-sm text-text-secondary">AI가 이해한 조건</span>
      {tags.map((t) => (
        <span
          key={`${t.axis}-${t.label}`}
          className="bg-bg-subtle text-caption-segment text-text-secondary inline-flex items-center gap-0.5 rounded-sm py-0.5 pr-0.5 pl-1.5"
        >
          {t.label}
          <button
            type="button"
            aria-label={`${t.label} 삭제`}
            onClick={() => onRemove(t.axis, t.label)}
            className="hover:text-text-primary inline-flex size-4 items-center justify-center rounded-sm"
          >
            <X size={12} aria-hidden />
          </button>
        </span>
      ))}
      <button
        type="button"
        onClick={onEdit}
        className="text-body-sm text-text-primary font-medium underline"
      >
        조건 수정
      </button>
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
