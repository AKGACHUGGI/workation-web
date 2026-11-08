import type { ReactNode } from 'react'

type Props = {
  selected?: boolean
  disabled?: boolean
  onClick?: () => void
  children: ReactNode
  /** 툴팁 문구 (disabled 사유 등) */
  title?: string
  className?: string
  /** sm = 32 (지도 패널·필터 칩), md = 42 · py-2.5 (Figma 화면의 예시·프리셋·월·비교 칩) */
  size?: 'sm' | 'md'
  /** Tooltip 이 주입한다 */
  'aria-describedby'?: string
}

/** Figma Chip 7:139. h 32(sm) / 42(md) · px 16 · 14/20 Medium · rounded-full. 선택 상태는 잉크(selected-*), 토글은 aria-pressed */
export default function Chip({
  selected = false,
  disabled = false,
  onClick,
  children,
  title,
  className = '',
  size = 'sm',
  'aria-describedby': describedBy,
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
      aria-describedby={describedBy}
      title={title}
      onClick={disabled ? undefined : onClick}
      className={`text-body-sm inline-flex ${size === 'md' ? 'h-10.5' : 'h-8'} shrink-0 items-center gap-1 rounded-full border px-4 font-medium whitespace-nowrap ${tone} ${dim} ${className}`}
    >
      {children}
    </button>
  )
}
