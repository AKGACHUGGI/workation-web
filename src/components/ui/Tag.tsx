import type { ReactNode } from 'react'

type Props = { children: ReactNode; tone?: 'default' | 'selected'; className?: string }

/** Figma Tag. Chip 보다 작은 라벨(클릭 없음) */
export default function Tag({ children, tone = 'default', className = '' }: Props) {
  const toneClass =
    tone === 'selected'
      ? 'bg-selected-bg text-selected-fg'
      : 'bg-bg-surface-strong text-text-secondary'
  return (
    <span
      className={`text-caption-xs inline-flex h-6 items-center rounded-md px-2 font-medium ${toneClass} ${className}`}
    >
      {children}
    </span>
  )
}
