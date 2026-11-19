import type { RefObject } from 'react'
import { thumbTransition } from '@/hooks/useSlidingThumb'
import type { Thumb } from '@/hooks/useSlidingThumb'

type Props = {
  thumbRef: RefObject<HTMLSpanElement | null>
  thumb: Thumb | null
  /** 바탕색·라운드 (예: 'bg-selected-bg rounded-md') */
  className: string
}

/** 세그먼트 토글의 선택 칸. 목록(relative) 맨 앞에 두고 버튼은 relative 로 그 위에 그린다 */
export default function SlidingThumb({ thumbRef, thumb, className }: Props) {
  return (
    <span
      ref={thumbRef}
      aria-hidden
      hidden={!thumb}
      data-slot="sliding-thumb"
      className={`pointer-events-none absolute motion-reduce:transition-none! ${className}`}
      style={{
        left: thumb?.left,
        right: thumb?.right,
        top: thumb?.top,
        height: thumb?.height,
        transition: thumbTransition(thumb),
      }}
    />
  )
}
