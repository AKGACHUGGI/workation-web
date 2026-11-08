type Size = 'sm' | 'md' | 'lg'

type Props = { initial: string; size?: Size; className?: string }

/** Figma Avatar 27:131: sm 24 · md 32 · lg 56, 글자는 Bold 12 / 14 / 20 */
const SIZE: Record<Size, string> = {
  sm: 'size-6 text-caption-xs font-bold', // 24 · 노트 작성 바 · 사진 작성자
  md: 'size-8 text-body-sm font-bold', // 32 · 노트 카드 · Navbar 계정 필
  lg: 'size-14 text-heading-xl', // 56 · W-08 프로필 헤더
}

/** 이니셜 1글자 아바타. brand/soft 바탕 + brand/soft-border 테두리 + brand 글자 */
export default function Avatar({ initial, size = 'md', className = '' }: Props) {
  return (
    <span
      aria-hidden="true"
      className={`bg-brand-soft border-brand-soft-border text-text-brand inline-flex shrink-0 items-center justify-center rounded-full border ${SIZE[size]} ${className}`}
    >
      {initial.slice(0, 1)}
    </span>
  )
}
