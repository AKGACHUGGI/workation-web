import type { ReactNode } from 'react'

type Props = {
  selected?: boolean
  disabled?: boolean
  onClick?: () => void
  children: ReactNode
  /** 툴팁 문구 (disabled 사유 등) */
  title?: string
  className?: string
}

/** Figma Chip 7:139. 선택 상태는 잉크(selected-*), 토글은 aria-pressed */
export default function Chip({
  selected = false,
  disabled = false,
  onClick,
  children,
  title,
  className = '',
}: Props) {
  const tone = selected
    ? 'bg-selected-bg text-selected-fg border-selected-bg'
    : 'bg-bg-surface text-text-primary border-border-default hover:border-border-strong'
  const dim = disabled ? 'cursor-not-allowed opacity-dim' : 'cursor-pointer'
  return (
    <button
      type="button"
      aria-pressed={selected}
      aria-disabled={disabled || undefined}
      title={title}
      onClick={disabled ? undefined : onClick}
      className={`text-caption-segment inline-flex h-8 shrink-0 items-center gap-1 rounded-full border px-4 whitespace-nowrap ${tone} ${dim} ${className}`}
    >
      {children}
    </button>
  )
}
