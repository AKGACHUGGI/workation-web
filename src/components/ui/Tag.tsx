import type { ReactNode } from 'react'

type Props = {
  children: ReactNode
  /** default: bg/subtle 회색 · selected: 잉크 · brand: brand/soft 바탕 + brand 글자 (Figma tone=brand 7:142) */
  tone?: 'default' | 'selected' | 'brand'
  className?: string
}

const TONE: Record<NonNullable<Props['tone']>, string> = {
  default: 'bg-bg-subtle text-text-secondary',
  selected: 'bg-selected-bg text-selected-fg',
  brand: 'bg-brand-soft text-text-brand',
}

/** Figma Tag 7:144. px 6 · py 2 · 12/16 Medium · radius/sm. Chip 보다 작은 라벨(클릭 없음) */
export default function Tag({ children, tone = 'default', className = '' }: Props) {
  return (
    <span
      className={`text-caption-segment inline-flex items-center rounded-sm px-1.5 py-0.5 ${TONE[tone]} ${className}`}
    >
      {children}
    </span>
  )
}
