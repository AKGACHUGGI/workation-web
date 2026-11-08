type Props = {
  id: string
  label: string
  /** 라벨 아래 한 줄 설명 (12 tertiary). 스위치는 라벨+설명 두 줄의 세로 가운데 */
  description?: string
  checked: boolean
  onChange: (next: boolean) => void
  disabled?: boolean
}

/**
 * 알림 설정 스위치 (Figma W-08 251:4740). role=switch + aria-checked.
 * 라벨 14 Medium · 설명 12 tertiary · 스위치 44×24, 켜짐 brand/primary
 */
export default function Toggle({
  id,
  label,
  description,
  checked,
  onChange,
  disabled = false,
}: Props) {
  return (
    <label htmlFor={id} className="flex cursor-pointer items-center justify-between gap-3">
      <span className="flex min-w-0 flex-1 flex-col gap-0.5">
        <span className="text-body-sm text-text-primary font-medium">{label}</span>
        {description && <span className="text-caption-xs text-text-tertiary">{description}</span>}
      </span>
      <button
        id={id}
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={label}
        disabled={disabled}
        onClick={() => onChange(!checked)}
        className={`disabled:opacity-dim relative h-6 w-11 shrink-0 rounded-full transition-colors ${
          checked ? 'bg-brand-primary' : 'bg-gray-300'
        }`}
      >
        <span
          className={`bg-bg-surface absolute top-1 h-4 w-4 rounded-full transition-all ${
            checked ? 'left-6' : 'left-1'
          }`}
        />
      </button>
    </label>
  )
}
