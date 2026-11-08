import type { ReactNode } from 'react'

type Props = { children: ReactNode; tone?: 'default' | 'selected'; className?: string }

/** Figma Tag 7:144. px 6 · py 2 · 12/16 Medium · radius/sm. Chip 보다 작은 라벨(클릭 없음) */
export default function Tag({ children, tone = 'default', className = '' }: Props) {
  const toneClass =
    tone === 'selected' ? 'bg-selected-bg text-selected-fg' : 'bg-bg-subtle text-text-secondary'
  return (
    <span
      className={`text-caption-segment inline-flex items-center rounded-sm px-1.5 py-0.5 ${toneClass} ${className}`}
    >
      {children}
    </span>
  )
}
