import { X } from 'lucide-react'
import Chip from '@/components/ui/Chip'
import { COMPARE_COPY } from '@/features/compare/copy'

type Entry = { id: string; name: string; sigunguName: string }

type Props = {
  entries: Entry[]
  canAdd: boolean
  onRemove: (id: string) => void
  onAdd: () => void
}

/** "비교 중" 줄: 선택된 동 칩(×) + 행정동 추가 칩 + 최대 3개 캡션 */
export default function CompareChips({ entries, canAdd, onRemove, onAdd }: Props) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="text-body-sm text-text-secondary font-medium">{COMPARE_COPY.comparing}</span>
      <div className="flex flex-wrap items-center gap-2">
        {entries.map((e) => (
          // Chip 은 <button> 이라 안에 × 버튼을 넣으면 button 중첩이 된다 → 같은 스타일의 span
          <span
            key={e.id}
            className="bg-selected-bg text-selected-fg text-body-sm inline-flex h-8 items-center gap-1 rounded-full px-4 font-medium whitespace-nowrap"
          >
            {e.name} · {e.sigunguName}
            <button
              type="button"
              aria-label={`${e.name} 제거`}
              onClick={() => onRemove(e.id)}
              className="ml-1 inline-flex rounded-full"
            >
              <X size={14} aria-hidden />
            </button>
          </span>
        ))}
        <Chip
          onClick={onAdd}
          disabled={!canAdd}
          title={canAdd ? undefined : COMPARE_COPY.maxTooltip}
        >
          {COMPARE_COPY.add}
        </Chip>
      </div>
      <span className="text-caption-xs text-text-tertiary">{COMPARE_COPY.max}</span>
    </div>
  )
}
