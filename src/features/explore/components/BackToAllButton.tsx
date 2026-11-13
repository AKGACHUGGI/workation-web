import { ChevronLeft } from 'lucide-react'
import { EXPLORE_COPY } from '@/features/explore/copy'

/** ① → ⓪ (Figma BackToSigungu 388:9127). 지도 키가 없어도 보이도록 페이지가 지도 왼쪽 위에 놓는다 */
export default function BackToAllButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="bg-bg-surface border-border-default text-caption-xs text-text-primary inline-flex items-center gap-0.5 rounded-full border px-3 py-1.5 font-bold"
    >
      <ChevronLeft size={14} aria-hidden />
      {EXPLORE_COPY.backToAll}
    </button>
  )
}
