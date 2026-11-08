type Props = {
  id: string
  label: string
  value: string
  onChange: (value: string) => void
  maxLength?: number
  error?: string
  hint?: string
  autoFocus?: boolean
}

export default function TextField({
  id,
  label,
  value,
  onChange,
  maxLength,
  error,
  hint,
  autoFocus,
}: Props) {
  const describedBy = error ? `${id}-error` : hint ? `${id}-hint` : undefined
  const border = error ? 'border-signal-avoid' : 'border-border-default focus:border-border-strong'
  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={id} className="text-body-sm text-text-secondary font-medium">
        {label}
      </label>
      <input
        id={id}
        type="text"
        value={value}
        maxLength={maxLength}
        autoFocus={autoFocus}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy}
        onChange={(e) => onChange(e.target.value)}
        className={`text-body-base text-text-primary bg-bg-surface h-11 rounded-lg border px-3 outline-none ${border}`}
      />
      {error ? (
        <span id={`${id}-error`} className="text-caption-xs text-signal-avoid">
          {error}
        </span>
      ) : hint ? (
        <span id={`${id}-hint`} className="text-caption-xs text-text-tertiary">
          {hint}
        </span>
      ) : null}
    </div>
  )
}
