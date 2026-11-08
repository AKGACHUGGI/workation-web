import { useCallback, useEffect, useState } from 'react'

/**
 * 요소의 콘텐츠 폭(px)을 ResizeObserver 로 따라간다. 고정 폭 차트(Recharts LineChart)를 열 폭에 맞출 때 쓴다.
 * 콜백 ref 라서 스켈레톤 → 본문처럼 요소가 나중에 생겨도 붙는다. 측정 전·jsdom(ResizeObserver 스텁)에서는 fallback.
 */
export function useElementWidth<T extends HTMLElement>(fallback: number) {
  const [el, setEl] = useState<T | null>(null)
  const [width, setWidth] = useState(fallback)
  const ref = useCallback((node: T | null) => setEl(node), [])
  useEffect(() => {
    if (!el) return
    const observer = new ResizeObserver(([entry]) => {
      const w = Math.floor(entry.contentRect.width)
      if (w > 0) setWidth(w)
    })
    observer.observe(el)
    return () => observer.disconnect()
  }, [el])
  return [ref, width] as const
}
