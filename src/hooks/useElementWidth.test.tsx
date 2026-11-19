import { afterEach, describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { useElementWidth } from '@/hooks/useElementWidth'

function Probe() {
  const [ref, width, measured] = useElementWidth<HTMLDivElement>(300)
  return (
    <div ref={ref}>
      <output>{`${width}|${measured}`}</output>
    </div>
  )
}

afterEach(() => vi.restoreAllMocks())

describe('useElementWidth', () => {
  it('첫 화면을 그리기 전에 실제 폭을 재서 measured 를 켠다 (임시 폭으로 차트 애니메이션이 시작되지 않게)', () => {
    vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockReturnValue({
      width: 400.6,
    } as DOMRect)
    render(<Probe />)
    expect(screen.getByRole('status')).toHaveTextContent('400|true')
  })
  it('폭을 잴 수 없으면(jsdom) fallback 폭으로 measured 를 켠다', () => {
    render(<Probe />)
    expect(screen.getByRole('status')).toHaveTextContent('300|true')
  })
})
