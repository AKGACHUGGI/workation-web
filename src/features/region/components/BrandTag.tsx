import type { ReactNode } from 'react'

type Props = { children: ReactNode; className?: string }

/**
 * Figma Tag tone=brand (7:142). brand/soft 배경 + text/brand 글자.
 * 공통 Tag 에 brand tone 이 없어 W-03·W-04 화면 쪽에 둔다 (공통 부품은 이번 단계에서 고치지 않음).
 */
export default function BrandTag({ children, className = '' }: Props) {
  return (
    <span
      className={`bg-brand-soft text-text-brand text-caption-segment inline-flex items-center rounded-sm px-1.5 py-0.5 ${className}`}
    >
      {children}
    </span>
  )
}
