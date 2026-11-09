import { EXPLORE_COPY } from '@/features/explore/copy'

type Props = {
  kind: 'dong' | 'tag'
  label: string
  /** tag 노드 묶음 색 (CSS 변수 문자열) */
  color?: string
  /** dong 노드 아래 배지 (`바닷가 · 해안 0.4km`) */
  badges?: string[]
  /** tag 노드 옆 `+N곳 더` */
  more?: number
  onMore?: () => void
}

/** ② 그래프 노드 (Figma Explore/GraphNode). 중심 = 동 이름, 허브 = `{태그} · {n}` */
export default function GraphNode({ kind, label, color, badges = [], more = 0, onMore }: Props) {
  if (kind === 'dong') {
    return (
      <span className="flex flex-col items-center gap-1">
        <span
          aria-hidden
          className="bg-bg-surface border-text-primary ring-brand-soft-border size-7 rounded-full border-4 ring-8"
        />
        <span className="bg-bg-surface text-heading-lg text-text-primary rounded-md px-1.5">
          {label}
        </span>
        {badges.map((b) => (
          <span
            key={b}
            className="bg-bg-surface border-border-strong text-caption-xs text-text-primary rounded-full border px-2 py-0.5 font-medium"
          >
            {b}
          </span>
        ))}
      </span>
    )
  }
  return (
    <span className="flex items-center gap-1">
      <span
        className="bg-bg-surface text-body-sm inline-flex items-center gap-1.5 rounded-full border-2 px-3 py-1 font-bold"
        style={{ borderColor: color, color }}
      >
        <span aria-hidden className="size-2 rounded-full" style={{ background: color }} />
        {label}
      </span>
      {more > 0 && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation()
            onMore?.()
          }}
          className="bg-bg-surface shadow-float text-caption-xs rounded-full px-2 py-0.5 font-bold"
          style={{ color }}
        >
          {EXPLORE_COPY.more(more)}
        </button>
      )}
    </span>
  )
}
