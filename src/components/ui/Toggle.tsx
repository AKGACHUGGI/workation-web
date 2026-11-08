type Props = {
  id: string
  label: string
  checked: boolean
  onChange: (next: boolean) => void
  disabled?: boolean
}

/** 알림 설정 스위치. role=switch + aria-checked */
export default function Toggle({ id, label, checked, onChange, disabled = false }: Props) {
  return (
    <label htmlFor={id} className="flex cursor-pointer items-center justify-between gap-4">
      <span className="text-body-sm text-text-primary">{label}</span>
      <button
        id={id}
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={label}
        disabled={disabled}
        onClick={() => onChange(!checked)}
        className={`disabled:opacity-dim relative h-6 w-11 shrink-0 rounded-full transition-colors ${
          checked ? 'bg-selected-bg' : 'bg-gray-300'
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
