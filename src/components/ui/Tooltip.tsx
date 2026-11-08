import { cloneElement, useId, useState } from 'react'
import type { ReactElement } from 'react'

type Props = {
  content: string
  /** aria-describedby 를 받을 수 있는 요소 하나 (button, span[tabIndex] 등) */
  children: ReactElement<{ 'aria-describedby'?: string }>
}

/** 호버·포커스 시 위쪽에 뜨는 툴팁. 자식에 aria-describedby 를 연결한다 */
export default function Tooltip({ content, children }: Props) {
  const id = useId()
  const [open, setOpen] = useState(false)
  return (
    <span
      className="relative inline-flex"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
      onFocus={() => setOpen(true)}
      onBlur={() => setOpen(false)}
    >
      {cloneElement(children, { 'aria-describedby': id })}
      <span
        role="tooltip"
        id={id}
        hidden={!open}
        className="bg-bg-inverse text-caption-xs text-text-inverse shadow-float absolute bottom-full left-1/2 z-20 mb-2 w-max max-w-64 -translate-x-1/2 rounded-md px-3 py-2"
      >
        {content}
      </span>
    </span>
  )
}
