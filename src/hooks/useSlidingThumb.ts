import { useLayoutEffect, useRef, useState } from 'react'

/** animate: 첫 배치는 제자리에 바로 놓고 이후 이동만 움직인다 */
export type Thumb = {
  left: number
  right: number
  top: number
  height: number
  dir: 1 | -1
  animate: boolean
}

/** 전체 모션 길이. 움츠림 70ms → 앞끝 → 뒤끝 도착이 이 안에 끝난다 (스펙 §6-3, 450ms 안쪽) */
export const THUMB_MS = 440
const LEAD = '250ms var(--ease-spring) 70ms'
const TRAIL = '320ms var(--ease-spring) 120ms'

/** 진행 방향 앞끝은 빨리, 뒤끝은 늦게 따라와 늘어났다 스프링으로 붙는다 (Navbar TabIndicator 와 같은 방식) */
export function thumbTransition(thumb: Thumb | null): string {
  if (!thumb?.animate) return 'none'
  const [lead, trail] = thumb.dir === 1 ? ['right', 'left'] : ['left', 'right']
  return `${lead} ${LEAD}, ${trail} ${TRAIL}, top ${LEAD}, height ${LEAD}`
}

const reduceMotion = () => window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false

/** 1단계 움츠림과 3단계 크기 복귀. 위치는 transition 이 맡는다. jsdom 에는 animate 가 없다 */
function squeeze(el: HTMLElement | null) {
  el?.animate?.(
    [
      { transform: 'scale(1)' },
      { transform: 'scale(0.92, 0.9)', offset: 0.16 },
      { transform: 'scale(0.97, 0.95)', offset: 0.6 },
      { transform: 'scale(1)' },
    ],
    { duration: THUMB_MS, easing: 'ease-out' },
  )
}

/**
 * 세그먼트 토글의 움직이는 칸 (다크모드·쫀득토글 스펙 §6).
 * listRef 안의 [aria-selected="true"] 위치를 재고, selectedKey 가 바뀌면
 * 움츠림 → 앞끝 먼저 늘어남 → 스프링 도착 순서로 옮긴다. 선택이 없으면 thumb 는 null
 */
export default function useSlidingThumb(selectedKey: string | null) {
  const listRef = useRef<HTMLDivElement>(null)
  const thumbRef = useRef<HTMLSpanElement>(null)
  const prevKey = useRef<string | null>(null)
  const [thumb, setThumb] = useState<Thumb | null>(null)

  useLayoutEffect(() => {
    const el = listRef.current
    if (!el) return
    const measure = () => {
      const active = el.querySelector<HTMLElement>('[aria-selected="true"]')
      if (!active) return setThumb(null)
      const left = active.offsetLeft
      setThumb((prev) => ({
        left,
        right: el.clientWidth - left - active.offsetWidth,
        top: active.offsetTop,
        height: active.offsetHeight,
        dir: prev && left < prev.left ? -1 : 1,
        animate: prev !== null && !reduceMotion(),
      }))
    }
    measure()
    const moved =
      prevKey.current !== null && selectedKey !== null && prevKey.current !== selectedKey
    if (moved && !reduceMotion()) squeeze(thumbRef.current)
    prevKey.current = selectedKey
    document.fonts?.ready.then(measure)
    // 웹폰트 로드·창 크기 변화로 버튼 폭이 바뀌면 다시 잰다
    if (typeof ResizeObserver === 'undefined') return
    const ro = new ResizeObserver(measure)
    ro.observe(el)
    return () => ro.disconnect()
  }, [selectedKey])

  return { listRef, thumbRef, thumb }
}
