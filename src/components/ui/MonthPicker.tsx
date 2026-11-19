import { useLayoutEffect, useRef, useState } from 'react'
import type { KeyboardEvent } from 'react'
import { CalendarDays, ChevronDown, X } from 'lucide-react'
import Modal from '@/components/ui/Modal'
import { MONTHS, monthLabel } from '@/features/metric/month'
import type { MonthParam } from '@/features/metric/month'

type Props = {
  value: MonthParam
  onChange: (month: MonthParam) => void
  className?: string
}

const TITLE_ID = 'month-picker-title'
/** 휠 한 칸 높이(px). 스크롤 위치 ÷ 이 값 = 가운데 칸 */
const ITEM_H = 48
/** 가운데 위·아래로 보이는 칸 수 */
const SIDE = 2

/** 가운데에서 멀수록 작고 옅게 (iOS 피커 느낌) */
function itemStyle(distance: number) {
  const d = Math.min(distance, 3)
  return {
    transform: `scale(${[1, 0.88, 0.76, 0.7][d]})`,
    opacity: [1, 0.55, 0.3, 0.15][d],
  }
}

/** 연간 · 1월~12월 세로 휠. 스크롤이 칸에 딱 맞춰 멈추고 가운데 칸이 선택값 */
function MonthWheel({ index, onIndex }: { index: number; onIndex: (i: number) => void }) {
  const ref = useRef<HTMLDivElement>(null)

  // 처음 열 때 현재 달을 가운데에 (애니메이션 없이)
  useLayoutEffect(() => {
    if (ref.current) ref.current.scrollTop = index * ITEM_H
    // 마운트 시 1회만
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const scrollTo = (i: number) => {
    const next = Math.min(Math.max(i, 0), MONTHS.length - 1)
    onIndex(next)
    ref.current?.scrollTo?.({ top: next * ITEM_H, behavior: 'smooth' })
  }

  const onKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      e.preventDefault()
      scrollTo(index + (e.key === 'ArrowDown' ? 1 : -1))
    }
  }

  return (
    <div className="relative" style={{ height: ITEM_H * (SIDE * 2 + 1) }}>
      {/* 가운데 선택 띠 */}
      <div
        aria-hidden
        className="bg-bg-subtle pointer-events-none absolute inset-x-0 rounded-lg"
        style={{ top: ITEM_H * SIDE, height: ITEM_H }}
      />
      <div
        ref={ref}
        role="listbox"
        aria-label="월"
        aria-activedescendant={`month-option-${index}`}
        tabIndex={0}
        onKeyDown={onKeyDown}
        onScroll={(e) => {
          const i = Math.round(e.currentTarget.scrollTop / ITEM_H)
          if (i !== index && i >= 0 && i < MONTHS.length) onIndex(i)
        }}
        className="relative h-full snap-y snap-mandatory [scrollbar-width:none] overflow-y-scroll [&::-webkit-scrollbar]:hidden"
      >
        <div aria-hidden style={{ height: ITEM_H * SIDE }} />
        {MONTHS.map((m, i) => (
          <div
            key={m}
            id={`month-option-${i}`}
            role="option"
            aria-selected={i === index}
            onClick={() => scrollTo(i)}
            className={`flex snap-center items-center justify-center transition-[transform,opacity] duration-150 ${
              i === index
                ? 'text-heading-xl text-text-primary'
                : 'text-heading-lg text-text-secondary'
            } cursor-pointer select-none`}
            style={{ height: ITEM_H, ...itemStyle(Math.abs(i - index)) }}
          >
            {monthLabel(m)}
          </div>
        ))}
        <div aria-hidden style={{ height: ITEM_H * SIDE }} />
      </div>
    </div>
  )
}

/** 월 선택 버튼. 누르면 "기간 선택" 모달의 휠에서 고르고 [선택 완료]로 반영한다 */
export default function MonthPicker({ value, onChange, className = '' }: Props) {
  const [open, setOpen] = useState(false)
  const [draft, setDraft] = useState(0)

  const openPicker = () => {
    setDraft(Math.max(0, MONTHS.indexOf(value)))
    setOpen(true)
  }

  return (
    <>
      <button
        type="button"
        aria-haspopup="dialog"
        aria-label={`월 선택: ${monthLabel(value)}`}
        onClick={openPicker}
        className={`border-border-default bg-bg-surface text-body-sm text-text-primary hover:border-text-primary inline-flex h-10.5 items-center gap-2 rounded-full border px-4 font-medium transition-colors ${className}`}
      >
        <CalendarDays size={16} aria-hidden />
        {monthLabel(value)}
        <ChevronDown size={16} aria-hidden className="text-text-secondary" />
      </button>
      <Modal open={open} onClose={() => setOpen(false)} titleId={TITLE_ID} width="sm">
        <div className="flex flex-col gap-6">
          <div className="border-border-default -mx-6 flex items-center justify-between border-b px-6 pb-4">
            <h2 id={TITLE_ID} className="text-heading-lg text-text-primary">
              기간 선택
            </h2>
            <button
              type="button"
              aria-label="닫기"
              onClick={() => setOpen(false)}
              className="text-text-primary rounded-md"
            >
              <X size={22} aria-hidden />
            </button>
          </div>
          <MonthWheel index={draft} onIndex={setDraft} />
          <button
            type="button"
            onClick={() => {
              onChange(MONTHS[draft])
              setOpen(false)
            }}
            className="bg-selected-bg text-selected-fg text-body-base h-12 rounded-lg font-bold"
          >
            선택 완료
          </button>
        </div>
      </Modal>
    </>
  )
}
