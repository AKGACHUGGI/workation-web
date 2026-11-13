import { EXPLORE_COPY } from '@/features/explore/copy'
import { RELATIONS } from '@/features/explore/sigunguGraph'
import type { RelationKey } from '@/features/explore/sigunguGraph'
import { RELATION_BG } from '@/features/explore/components/panel/relationColor'

type Props = { on: ReadonlySet<RelationKey>; onToggle: (key: RelationKey) => void }

/**
 * ① 관계 줄 (Figma 434:9728). 이름은 스펙 §3-2 표 (RELATIONS).
 * 항상 켜진 관계는 테두리 없이 색 점과 이름만, 토글 칩(조용함·저녁 활기 등급)만 버튼
 */
export default function RelationChips({ on, onToggle }: Props) {
  return (
    <div
      role="group"
      aria-label={EXPLORE_COPY.relationChipsLabel}
      className="flex shrink-0 flex-wrap items-center gap-1.5"
    >
      {RELATIONS.filter((r) => !r.toggle).map((r) => (
        <span
          key={r.key}
          className="text-caption-xs text-text-primary inline-flex items-center gap-1.5 py-1.25 pr-1.5 font-medium"
        >
          <span aria-hidden className={`size-2 rounded-full ${RELATION_BG[r.key]}`} />
          {r.label}
        </span>
      ))}
      {RELATIONS.filter((r) => r.toggle).map((r) => {
        const active = on.has(r.key)
        return (
          <button
            key={r.key}
            type="button"
            aria-pressed={active}
            onClick={() => onToggle(r.key)}
            className={`border-border-default text-caption-xs inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1.25 ${active ? 'bg-bg-surface text-text-primary font-medium' : 'text-text-tertiary'}`}
          >
            <span
              aria-hidden
              className={`size-2 rounded-full ${active ? RELATION_BG[r.key] : 'bg-border-strong'}`}
            />
            {r.label}
          </button>
        )
      })}
    </div>
  )
}
