import { useEffect, useId, useRef, useState } from 'react'
import type { KeyboardEvent } from 'react'
import { ChevronDown } from 'lucide-react'

export type DropdownOption<T extends string> = { value: T; label: string }

type Props<T extends string> = {
  options: DropdownOption<T>[]
  value: T
  onChange: (value: T) => void
  ariaLabel: string
  className?: string
}

/** 단일 선택 드롭다운. 버튼(aria-haspopup=listbox) + listbox/option. */
export default function Dropdown<T extends string>({
  options,
  value,
  onChange,
  ariaLabel,
  className = '',
}: Props<T>) {
  const [open, setOpen] = useState(false)
  const [active, setActive] = useState(() =>
    Math.max(
      0,
      options.findIndex((o) => o.value === value),
    ),
  )
  const rootRef = useRef<HTMLDivElement>(null)
  const listId = useId()
  const current = options.find((o) => o.value === value) ?? options[0]

  useEffect(() => {
    if (!open) return
    const onDown = (e: MouseEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', onDown)
    return () => document.removeEventListener('mousedown', onDown)
  }, [open])

  const select = (i: number) => {
    onChange(options[i].value)
    setOpen(false)
  }

  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Escape') {
      setOpen(false)
      return
    }
    if (!open) {
      if (e.key === 'Enter' || e.key === ' ' || e.key === 'ArrowDown') {
        e.preventDefault()
        setActive(
          Math.max(
            0,
            options.findIndex((o) => o.value === value),
          ),
        )
        setOpen(true)
      }
      return
    }
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setActive((i) => Math.min(options.length - 1, i + 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setActive((i) => Math.max(0, i - 1))
    } else if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      select(active)
    }
  }

  return (
    <div ref={rootRef} className={`relative inline-block ${className}`} onKeyDown={onKeyDown}>
      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={open ? listId : undefined}
        aria-label={`${ariaLabel}: ${current.label}`}
        onClick={() => setOpen((v) => !v)}
        className="border-border-default bg-bg-surface text-body-sm text-text-primary hover:border-border-strong inline-flex h-9 items-center gap-2 rounded-lg border px-3"
      >
        {current.label}
        <ChevronDown size={16} aria-hidden />
      </button>
      {open && (
        <ul
          id={listId}
          role="listbox"
          aria-label={ariaLabel}
          className="border-border-default bg-bg-surface shadow-float absolute top-full right-0 z-20 mt-1 min-w-full rounded-lg border py-1"
        >
          {options.map((opt, i) => {
            const selected = opt.value === value
            return (
              <li
                key={opt.value}
                role="option"
                aria-selected={selected}
                onMouseEnter={() => setActive(i)}
                onClick={() => select(i)}
                className={`text-body-sm cursor-pointer px-3 py-2 whitespace-nowrap ${
                  i === active ? 'bg-bg-subtle' : ''
                } ${selected ? 'text-text-primary font-medium' : 'text-text-secondary'}`}
              >
                {opt.label}
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
