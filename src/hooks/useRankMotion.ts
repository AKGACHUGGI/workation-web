import { useLayoutEffect, useRef } from 'react'

type Rects = Map<string, DOMRect>

const EASE = 'cubic-bezier(0.2, 0, 0, 1)'

function measure(root: HTMLElement | null): Rects | null {
  if (!root) return null
  const rects: Rects = new Map()
  for (const el of root.querySelectorAll<HTMLElement>('[data-rank-id]')) {
    rects.set(el.dataset.rankId!, el.getBoundingClientRect())
  }
  return rects
}

const reducedMotion = () => window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false

/**
 * 순위 카드 목록 모션 (W-01 인기 지역 · W-02 랭킹). 카드마다 data-rank-id 를 달고,
 * 돌려준 ref 를 카드들을 감싼 요소에 붙인다. source 는 응답(데이터) — 바뀌었는지만 본다.
 * - 첫 표시: 순서대로 아래 12px 에서 떠오른다 (40ms 간격, 13장째부터는 같이)
 * - 같은 응답에서 기준만 바뀜(정렬·프리셋·필터·더보기 등): 카드가 이전 자리에서 새 순위 자리로
 *   미끄러진다(FLIP). 다른 구역으로 옮겨 가는 카드도 같다. 새로 보이는 카드는 페이드
 * - 응답이 바뀜(달·범위): 카드 구성이 달라질 수 있어 전체를 짧게 페이드
 */
export function useRankMotion<T extends HTMLElement>(source: unknown) {
  const ref = useRef<T>(null)
  const prevSource = useRef<unknown>(undefined)
  // 커밋 전(렌더 중)에 지금 자리를 잡아 둔다. 더보기처럼 하위 상태로 바뀐 자리도 여기서 반영된다.
  // FLIP 은 DOM 이 바뀌기 직전 자리가 필요해 렌더 중에 읽는다 (React Compiler 미사용, 읽기만 함)
  // oxlint-disable-next-line react/refs
  const before = measure(ref.current)

  useLayoutEffect(() => {
    const root = ref.current
    if (!root) return
    const first = prevSource.current === undefined
    const sourceChanged = !first && prevSource.current !== source
    prevSource.current = source
    // jsdom 에는 Web Animations 가 없다
    if (typeof root.animate !== 'function' || reducedMotion()) return

    const cards = [...root.querySelectorAll<HTMLElement>('[data-rank-id]')]
    if (first) {
      cards.forEach((el, i) =>
        el.animate(
          [
            { transform: 'translateY(12px)', opacity: 0 },
            { transform: 'none', opacity: 1 },
          ],
          { duration: 320, delay: Math.min(i, 12) * 40, easing: EASE, fill: 'backwards' },
        ),
      )
      return
    }
    if (sourceChanged) {
      root.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 200, easing: 'ease-out' })
      return
    }
    if (!before) return
    for (const el of cards) {
      const prev = before.get(el.dataset.rankId!)
      // 이동 중에 또 바뀌면 지금 보이는 자리(변환 포함)에서 다시 출발
      for (const a of el.getAnimations()) a.cancel()
      if (!prev) {
        el.animate([{ opacity: 0 }, { opacity: 1 }], {
          duration: 240,
          delay: 120,
          easing: 'ease-out',
          fill: 'backwards',
        })
        continue
      }
      const now = el.getBoundingClientRect()
      const dx = prev.left - now.left
      const dy = prev.top - now.top
      if (Math.abs(dx) < 1 && Math.abs(dy) < 1) continue
      el.animate([{ transform: `translate(${dx}px, ${dy}px)` }, { transform: 'none' }], {
        duration: 450,
        easing: EASE,
      })
    }
  })

  return ref
}
