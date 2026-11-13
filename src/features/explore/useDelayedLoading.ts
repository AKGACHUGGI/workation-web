import { useEffect, useRef, useState } from 'react'

/**
 * 스켈레톤 깜빡임 방지 (스펙 §9-1). loading 이 delay 넘게 이어질 때만 true,
 * 한 번 true 가 되면 최소 min 동안 유지한다
 */
export function useDelayedLoading(loading: boolean, delay = 200, min = 400): boolean {
  const [shown, setShown] = useState(false)
  const shownAt = useRef(0)

  useEffect(() => {
    if (loading && !shown) {
      const t = setTimeout(() => {
        shownAt.current = Date.now()
        setShown(true)
      }, delay)
      return () => clearTimeout(t)
    }
    if (!loading && shown) {
      const left = Math.max(0, min - (Date.now() - shownAt.current))
      const t = setTimeout(() => setShown(false), left)
      return () => clearTimeout(t)
    }
  }, [loading, shown, delay, min])

  return shown
}
