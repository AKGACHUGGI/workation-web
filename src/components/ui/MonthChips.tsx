import { useEffect, useRef } from 'react'
import Chip from '@/components/ui/Chip'
import { MONTHS, monthLabel } from '@/features/metric/month'
import type { MonthParam } from '@/features/metric/month'

type Props = {
  value: MonthParam
  onChange: (month: MonthParam) => void
  className?: string
  /** 칩 크기. W-02·W-05 Figma 는 42(md) */
  size?: 'sm' | 'md'
}

/** 라벨 "월" + 연간·1월~12월 Chip. 가로 스크롤, 처음 렌더 시 선택 칩을 가운데로 */
export default function MonthChips({ value, onChange, className = '', size = 'md' }: Props) {
  const listRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const selected = listRef.current?.querySelector<HTMLElement>('[aria-pressed="true"]')
    if (selected && typeof selected.scrollIntoView === 'function') {
      selected.scrollIntoView({ inline: 'center', block: 'nearest' })
    }
    // 마운트 시 1회만
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div className={`flex min-w-0 items-center gap-2 ${className}`}>
      <span className="text-body-sm text-text-secondary shrink-0">월</span>
      <div ref={listRef} role="group" aria-label="월" className="flex gap-2 overflow-x-auto">
        {MONTHS.map((m) => (
          <Chip key={m} size={size} selected={m === value} onClick={() => onChange(m)}>
            {monthLabel(m)}
          </Chip>
        ))}
      </div>
    </div>
  )
}
