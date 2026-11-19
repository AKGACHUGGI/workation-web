import { useCallback, useEffect, useLayoutEffect, useState } from 'react'

/**
 * 요소의 콘텐츠 폭(px)을 ResizeObserver 로 따라간다. 고정 폭 차트(Recharts LineChart)를 열 폭에 맞출 때 쓴다.
 * 콜백 ref 라서 스켈레톤 → 본문처럼 요소가 나중에 생겨도 붙는다. 측정 전·jsdom(ResizeObserver 스텁)에서는 fallback.
 * measured: 붙은 요소의 폭을 첫 화면 전에 한 번 쟀다. 차트는 이게 켜진 뒤 그려야
 * 선 그리기 애니메이션이 fallback 폭의 선 길이에서 끊기지 않는다 (Recharts 는 시작할 때 잰 길이로 끝까지 그린다)
 */
export function useElementWidth<T extends HTMLElement>(fallback: number) {
  const [el, setEl] = useState<T | null>(null)
  const [width, setWidth] = useState(fallback)
  const [measured, setMeasured] = useState(false)
  const ref = useCallback((node: T | null) => setEl(node), [])
  useLayoutEffect(() => {
    if (!el) return
    const w = Math.floor(el.getBoundingClientRect().width)
    if (w > 0) setWidth(w)
    setMeasured(true)
  }, [el])
  useEffect(() => {
    if (!el) return
    const observer = new ResizeObserver(([entry]) => {
      const w = Math.floor(entry.contentRect.width)
      if (w > 0) setWidth(w)
    })
    observer.observe(el)
    return () => observer.disconnect()
  }, [el])
  return [ref, width, measured] as const
}
