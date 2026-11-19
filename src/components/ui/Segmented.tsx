import SlidingThumb from '@/components/ui/SlidingThumb'
import useSlidingThumb from '@/hooks/useSlidingThumb'

export type SegmentedOption<T extends string> = {
  value: T
  label: string
  disabled?: boolean
  /** disabled 사유 툴팁 */
  title?: string
}

type Props<T extends string> = {
  options: SegmentedOption<T>[]
  /** null 이면 아무것도 선택 표시 없음 (두 Segmented 가 한 값을 공유할 때) */
  value: T | null
  onChange: (value: T) => void
  ariaLabel?: string
  size?: 'sm' | 'md'
  /**
   * ink: 선택 칸 잉크 바탕 + 흰 글자 (W-01 지도 패널 범위 토글)
   * surface: 선택 칸 흰 바탕 + 잉크 글자 + 옅은 그림자 (Figma DayToggle 7:486, W-02 범위·탭 토글)
   */
  variant?: 'ink' | 'surface'
  className?: string
}

/** 탭·월·범위 선택 UI. role=tablist / tab + aria-selected. 선택 칸은 움직이는 칸 하나로 그린다 (쫀득토글 스펙 §6) */
export default function Segmented<T extends string>({
  options,
  value,
  onChange,
  ariaLabel,
  size = 'md',
  variant = 'ink',
  className = '',
}: Props<T>) {
  const { listRef, thumbRef, thumb } = useSlidingThumb(value)
  // Figma: sm = W-01 지도 패널 범위 토글(px 10 · py 4 · 12/16 Medium), md = DayToggle(px 16 · py 6 · 14/20 Medium)
  const item =
    size === 'sm' ? 'px-2.5 py-1 text-caption-segment' : 'px-4 py-1.5 text-body-sm font-medium'
  const thumbTone =
    variant === 'surface' ? 'bg-bg-surface shadow-xs rounded-md' : 'bg-selected-bg rounded-md'
  const selectedText = variant === 'surface' ? 'text-text-primary' : 'text-selected-fg'
  return (
    <div
      ref={listRef}
      role="tablist"
      aria-label={ariaLabel}
      className={`bg-bg-subtle relative inline-flex items-center gap-1 rounded-lg p-1 ${className}`}
    >
      <SlidingThumb thumbRef={thumbRef} thumb={thumb} className={thumbTone} />
      {options.map((opt) => {
        const selected = opt.value === value
        const tone = selected ? selectedText : 'text-text-secondary hover:text-text-primary'
        const dim = opt.disabled ? 'cursor-not-allowed opacity-dim' : 'cursor-pointer'
        return (
          <button
            key={opt.value}
            type="button"
            role="tab"
            aria-selected={selected}
            aria-disabled={opt.disabled || undefined}
            title={opt.title}
            onClick={opt.disabled ? undefined : () => onChange(opt.value)}
            // 칸이 지나가는 시점에 글자색이 바뀌도록 살짝 늦춘다. 굵기는 바꾸지 않는다
            className={`relative inline-flex items-center rounded-md whitespace-nowrap transition-colors delay-75 duration-200 motion-reduce:transition-none ${item} ${tone} ${dim}`}
          >
            {opt.label}
          </button>
        )
      })}
    </div>
  )
}
