type Size = 'sm' | 'md' | 'lg'

type Props = { initial: string; size?: Size; className?: string }

const SIZE: Record<Size, string> = {
  sm: 'size-8 text-caption-segment', // 32px
  md: 'size-10 text-body-sm font-medium', // 40px · Navbar
  lg: 'size-16 text-heading-xl', // 64px · W-08 프로필 헤더
}

/** 이니셜 1글자 아바타 (잉크 배경) */
export default function Avatar({ initial, size = 'md', className = '' }: Props) {
  return (
    <span
      aria-hidden="true"
      className={`bg-selected-bg text-selected-fg inline-flex shrink-0 items-center justify-center rounded-full ${SIZE[size]} ${className}`}
    >
      {initial.slice(0, 1)}
    </span>
  )
}
