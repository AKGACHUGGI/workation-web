import { EMPTY_NOTE } from '@/features/popular/copy'

type Props = { onClearFilter: () => void }

export default function PopularEmpty({ onClearFilter }: Props) {
  return (
    <div className="border-border-default flex flex-col items-center gap-3 rounded-xl border border-dashed py-16">
      <p className="text-body-base text-text-secondary">{EMPTY_NOTE}</p>
      <button
        type="button"
        onClick={onClearFilter}
        className="text-body-sm text-text-primary underline"
      >
        필터 지우기
      </button>
    </div>
  )
}
