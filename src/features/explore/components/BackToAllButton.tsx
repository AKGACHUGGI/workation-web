import { ArrowLeft } from 'lucide-react'
import { EXPLORE_COPY } from '@/features/explore/copy'

/** ① → ⓪ (Figma BackToSigungu 388:9127). 지도 키가 없어도 보이도록 페이지가 지도 왼쪽 위에 놓는다 */
export default function BackToAllButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={EXPLORE_COPY.backToAll}
      title={EXPLORE_COPY.backToAll}
      className="bg-bg-surface border-border-default text-text-primary hover:bg-bg-subtle inline-flex size-8 items-center justify-center rounded-full border"
    >
      <ArrowLeft size={16} aria-hidden />
    </button>
  )
}
