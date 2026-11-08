import { Plus } from 'lucide-react'
import { COMPARE_COPY } from '@/features/compare/copy'

type Props = { onAdd: () => void; hint?: string }

/** 동이 3개 미만일 때의 빈 열. 점선 테두리 + 추가 버튼 */
export default function EmptyColumn({ onAdd, hint }: Props) {
  return (
    <div className="border-border-default text-text-tertiary flex min-h-96 flex-col items-center justify-center gap-3 rounded-2xl border border-dashed p-6 text-center">
      <p className="text-body-sm">{COMPARE_COPY.emptyColumn}</p>
      {hint && <p className="text-caption-xs">{hint}</p>}
      <button
        type="button"
        onClick={onAdd}
        className="border-border-default text-body-sm text-text-primary hover:border-border-strong inline-flex items-center gap-1 rounded-lg border px-4 py-2"
      >
        <Plus size={16} aria-hidden /> 추가
      </button>
    </div>
  )
}
