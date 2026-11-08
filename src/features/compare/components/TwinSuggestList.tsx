import { Check } from 'lucide-react'
import type { QuieterTwin } from '@/features/dong/types'

type Props = {
  twins: QuieterTwin[]
  selectedIds: string[]
  onPick: (id: string) => void
}

/** 추천 탭: 첫 번째 열 동의 quieterTwins 카드 */
export default function TwinSuggestList({ twins, selectedIds, onPick }: Props) {
  if (twins.length === 0) {
    return (
      <p className="text-body-sm text-text-tertiary py-6 text-center">
        추천할 비슷한 동네가 없습니다
      </p>
    )
  }
  return (
    <ul role="listbox" aria-label="비슷한 동네" className="grid grid-cols-3 gap-3">
      {twins.map((t) => {
        const picked = selectedIds.includes(t.id)
        return (
          <li
            key={t.id}
            role="option"
            aria-selected={picked}
            aria-disabled={picked || undefined}
            onClick={picked ? undefined : () => onPick(t.id)}
            className={`border-border-default flex flex-col gap-1 rounded-xl border p-3 ${picked ? 'text-text-tertiary' : 'hover:border-border-strong cursor-pointer'}`}
          >
            <span className="flex items-center gap-1">
              {picked && <Check size={14} aria-hidden />}
              <span className="text-body-sm font-medium">{t.name}</span>
            </span>
            <span className="text-caption-xs text-text-tertiary">{t.sigunguName}</span>
            <span className="text-caption-xs text-text-secondary">
              유사도 {t.similarity.toFixed(2)} · 방문객 {t.visitorRatio.toFixed(2)}배
            </span>
          </li>
        )
      })}
    </ul>
  )
}
