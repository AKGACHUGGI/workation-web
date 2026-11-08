import type { ReactNode } from 'react'

type Props = {
  id: string
  checked: boolean
  onChange: (checked: boolean) => void
  label: ReactNode
}

export default function Checkbox({ id, checked, onChange, label }: Props) {
  return (
    <label
      htmlFor={id}
      className="text-body-sm text-text-primary flex cursor-pointer items-center gap-2"
    >
      <input
        id={id}
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="accent-selected-bg size-4"
      />
      <span>{label}</span>
    </label>
  )
}
