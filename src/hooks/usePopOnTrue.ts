import { useState } from 'react'

/**
 * flag 가 false → true 로 켜지는 순간마다 늘어나는 pop 카운터 (첫 렌더는 0).
 * 즐겨찾기는 로그인 모달을 거칠 수 있어 클릭이 아니라 상태가 켜지는 순간 반짝인다
 */
export function usePopOnTrue(flag: boolean): number {
  const [prev, setPrev] = useState(flag)
  const [pop, setPop] = useState(0)
  if (flag !== prev) {
    setPrev(flag)
    if (flag) setPop((n) => n + 1)
  }
  return pop
}
