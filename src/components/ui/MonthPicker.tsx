import { useLayoutEffect, useRef, useState } from 'react'
import type { KeyboardEvent } from 'react'
import { CalendarDays, ChevronDown, X } from 'lucide-react'
import Modal from '@/components/ui/Modal'
import { MONTHS, monthLabel } from '@/features/metric/month'
import type { MonthParam } from '@/features/metric/month'

export type PickerOption<T extends string> = { value: T; label: string }

type Props<T extends string> = {
  value: T
  onChange: (value: T) => void
  className?: string
  /** 휠에 보일 값. 기본은 연간 + 1~12월 */
  options?: readonly PickerOption<T>[]
  /** 모달 제목. 기본 '기간 선택' */
  title?: string
  /** 버튼 글자. 기본은 고른 값의 label */
  triggerLabel?: string
  /** sm: 노트 작성 바처럼 좁은 곳 */
  size?: 'md' | 'sm'
}

const MONTH_OPTIONS: readonly PickerOption<MonthParam>[] = MONTHS.map((m) => ({
  value: m,
  label: monthLabel(m),
}))

const TRIGGER_SIZE = {
  md: 'h-10.5 gap-2 px-4 text-body-sm',
  sm: 'h-8 gap-1 px-3 text-caption-segment',
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

/**
 * 연간 · 1월~12월 세로 휠. 스크롤이 칸에 딱 맞춰 멈추고 가운데 칸이 선택값.
 * 다른 목록(예: 온보딩 연령대)에도 쓴다. selected=false 면 아직 고르지 않은 상태라 선택 표시를 하지 않는다
 */
export function MonthWheel({
  labels,
  index,
  onIndex,
  ariaLabel = '월',
  idPrefix = 'month-option',
  selected = true,
}: {
  labels: readonly string[]
  index: number
  onIndex: (i: number) => void
  /** listbox 접근성 이름. 기본 '월' */
  ariaLabel?: string
  /** 항목 id 접두어. 기본 'month-option' */
  idPrefix?: string
  /** false 면 어떤 항목도 aria-selected 가 아니고 가운데 강조도 하지 않는다. 기본 true */
  selected?: boolean
}) {
  const ref = useRef<HTMLDivElement>(null)

  // 처음 열 때 현재 달을 가운데에 (애니메이션 없이)
  useLayoutEffect(() => {
    if (ref.current) ref.current.scrollTop = index * ITEM_H
    // 마운트 시 1회만
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const scrollTo = (i: number) => {
    const next = Math.min(Math.max(i, 0), labels.length - 1)
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
      {selected && (
        <div
          aria-hidden
          className="bg-bg-subtle pointer-events-none absolute inset-x-0 rounded-lg"
          style={{ top: ITEM_H * SIDE, height: ITEM_H }}
        />
      )}
      <div
        ref={ref}
        role="listbox"
        aria-label={ariaLabel}
        aria-activedescendant={selected ? `${idPrefix}-${index}` : undefined}
        tabIndex={0}
        onKeyDown={onKeyDown}
        onScroll={(e) => {
          const i = Math.round(e.currentTarget.scrollTop / ITEM_H)
          if (i !== index && i >= 0 && i < labels.length) onIndex(i)
        }}
        className="relative h-full snap-y snap-mandatory [scrollbar-width:none] overflow-y-scroll [&::-webkit-scrollbar]:hidden"
      >
        <div aria-hidden style={{ height: ITEM_H * SIDE }} />
        {labels.map((label, i) => (
          <div
            key={label}
            id={`${idPrefix}-${i}`}
            role="option"
            aria-selected={selected && i === index}
            onClick={() => scrollTo(i)}
            className={`flex snap-center items-center justify-center transition-[transform,opacity] duration-150 ${
              selected && i === index
                ? 'text-heading-xl text-text-primary'
                : 'text-heading-lg text-text-secondary'
            } cursor-pointer select-none`}
            style={{ height: ITEM_H, ...itemStyle(Math.abs(i - index)) }}
          >
            {label}
          </div>
        ))}
        <div aria-hidden style={{ height: ITEM_H * SIDE }} />
      </div>
    </div>
  )
}

/**
 * 월 선택 버튼. 누르면 "기간 선택" 모달의 휠에서 고르고 [선택 완료]로 반영한다.
 * options 를 주면 다른 값 목록(예: 노트 방문 월 '선택 안 함' + 1~12월)에도 쓴다
 */
export default function MonthPicker<T extends string = MonthParam>({
  value,
  onChange,
  className = '',
  options = MONTH_OPTIONS as unknown as readonly PickerOption<T>[],
  title = '기간 선택',
  triggerLabel,
  size = 'md',
}: Props<T>) {
  const [open, setOpen] = useState(false)
  const [draft, setDraft] = useState(0)
  const current = options.find((o) => o.value === value)?.label ?? ''
  const label = triggerLabel ?? current

  const openPicker = () => {
    setDraft(
      Math.max(
        0,
        options.findIndex((o) => o.value === value),
      ),
    )
    setOpen(true)
  }

  return (
    <>
      <button
        type="button"
        aria-haspopup="dialog"
        aria-label={`${title === '기간 선택' ? '월 선택' : title}: ${label}`}
        onClick={openPicker}
        className={`border-border-default bg-bg-surface text-text-primary hover:border-text-primary inline-flex items-center rounded-full border font-medium transition-colors ${TRIGGER_SIZE[size]} ${className}`}
      >
        <CalendarDays size={size === 'sm' ? 14 : 16} aria-hidden />
        {label}
        <ChevronDown size={size === 'sm' ? 14 : 16} aria-hidden className="text-text-secondary" />
      </button>
      <Modal open={open} onClose={() => setOpen(false)} titleId={TITLE_ID} width="sm">
        <div className="flex flex-col gap-6">
          <div className="border-border-default -mx-6 flex items-center justify-between border-b px-6 pb-4">
            <h2 id={TITLE_ID} className="text-heading-lg text-text-primary">
              {title}
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
          <MonthWheel labels={options.map((o) => o.label)} index={draft} onIndex={setDraft} />
          <button
            type="button"
            onClick={() => {
              onChange(options[draft].value)
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
