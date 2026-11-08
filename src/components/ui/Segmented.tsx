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
  className?: string
}

/** 탭·월·범위 선택 UI. role=tablist / tab + aria-selected */
export default function Segmented<T extends string>({
  options,
  value,
  onChange,
  ariaLabel,
  size = 'md',
  className = '',
}: Props<T>) {
  // Figma: sm = W-01 지도 패널 범위 토글(px 10 · py 4 · 12/16 Medium), md = DayToggle(px 16 · py 6 · 14/20 Medium)
  const item =
    size === 'sm' ? 'px-2.5 py-1 text-caption-segment' : 'px-4 py-1.5 text-body-sm font-medium'
  return (
    <div
      role="tablist"
      aria-label={ariaLabel}
      className={`bg-bg-subtle inline-flex items-center gap-1 rounded-lg p-1 ${className}`}
    >
      {options.map((opt) => {
        const selected = opt.value === value
        const tone = selected
          ? 'bg-selected-bg text-selected-fg'
          : 'text-text-secondary hover:text-text-primary'
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
            className={`inline-flex items-center rounded-md whitespace-nowrap ${item} ${tone} ${dim}`}
          >
            {opt.label}
          </button>
        )
      })}
    </div>
  )
}
