import { EXPLORE_COPY } from '@/features/explore/copy'

/** 핀 API 오류 (스펙 §9): 지도 위 카드 + 다시 시도 */
export default function PinsErrorCard({ onRetry }: { onRetry: () => void }) {
  return (
    <div
      role="alert"
      className="bg-bg-surface shadow-float flex items-center gap-3 rounded-xl px-5 py-3"
    >
      <span className="text-body-sm text-text-primary font-medium">{EXPLORE_COPY.pinsError}</span>
      <button
        type="button"
        onClick={onRetry}
        className="bg-selected-bg text-selected-fg text-body-sm rounded-lg px-4 py-2 font-bold"
      >
        {EXPLORE_COPY.retry}
      </button>
    </div>
  )
}
