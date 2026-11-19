import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { render } from '@testing-library/react'
import useSlidingThumb, { thumbTransition } from '@/hooks/useSlidingThumb'
import SlidingThumb from '@/components/ui/SlidingThumb'

/** jsdom 은 배치를 안 하므로 버튼 위치를 글자로 정한다: A 는 4~76, B 는 80~152, 목록 폭 160 */
function mockLayout() {
  vi.spyOn(HTMLElement.prototype, 'offsetLeft', 'get').mockImplementation(function (
    this: HTMLElement,
  ) {
    return this.textContent === 'B' ? 80 : 4
  })
  vi.spyOn(HTMLElement.prototype, 'offsetWidth', 'get').mockReturnValue(72)
  vi.spyOn(HTMLElement.prototype, 'offsetTop', 'get').mockReturnValue(4)
  vi.spyOn(HTMLElement.prototype, 'offsetHeight', 'get').mockReturnValue(28)
  vi.spyOn(HTMLElement.prototype, 'clientWidth', 'get').mockReturnValue(160)
}

function Probe({ value }: { value: 'A' | 'B' | null }) {
  const { listRef, thumbRef, thumb } = useSlidingThumb(value)
  return (
    <div ref={listRef} role="tablist">
      <SlidingThumb thumbRef={thumbRef} thumb={thumb} className="bg-selected-bg" />
      {(['A', 'B'] as const).map((v) => (
        <button key={v} role="tab" aria-selected={v === value}>
          {v}
        </button>
      ))}
    </div>
  )
}

const thumbOf = (c: HTMLElement) => c.querySelector<HTMLElement>('[data-slot="sliding-thumb"]')!

beforeEach(mockLayout)
afterEach(() => vi.restoreAllMocks())

describe('useSlidingThumb', () => {
  it('처음에는 선택 칸 자리에 움직임 없이 놓인다', () => {
    const { container } = render(<Probe value="A" />)
    const t = thumbOf(container)
    expect(t).not.toHaveAttribute('hidden')
    expect(t.style.left).toBe('4px')
    expect(t.style.right).toBe('84px')
    expect(t.style.top).toBe('4px')
    expect(t.style.height).toBe('28px')
    expect(t.style.transition).toBe('none')
  })
  it('오른쪽으로 옮기면 오른쪽 끝이 먼저(앞끝), 왼쪽 끝이 늦게 따라간다', () => {
    const { container, rerender } = render(<Probe value="A" />)
    rerender(<Probe value="B" />)
    const t = thumbOf(container)
    expect(t.style.left).toBe('80px')
    expect(t.style.right).toBe('8px')
    expect(t.style.transition.startsWith('right')).toBe(true)
  })
  it('선택이 없으면 칸을 숨긴다', () => {
    const { container } = render(<Probe value={null} />)
    expect(thumbOf(container)).toHaveAttribute('hidden')
  })
  it('thumbTransition: 왼쪽 이동은 left 가 앞끝, 첫 배치는 none', () => {
    const base = { left: 0, right: 0, top: 0, height: 0 }
    expect(thumbTransition(null)).toBe('none')
    expect(thumbTransition({ ...base, dir: 1, animate: false })).toBe('none')
    expect(thumbTransition({ ...base, dir: -1, animate: true }).startsWith('left')).toBe(true)
  })
})
