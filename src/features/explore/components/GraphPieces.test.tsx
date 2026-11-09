import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Laptop } from 'lucide-react'
import GraphNode from '@/features/explore/components/GraphNode'
import PlacePin from '@/features/explore/components/PlacePin'
import { clusterElement, pinElement } from '@/features/explore/pinDom'

describe('GraphNode', () => {
  it('dong: 이름 + 배지', () => {
    render(<GraphNode kind="dong" label="주문진읍" badges={['바닷가 · 해안 0.4km']} />)
    expect(screen.getByText('주문진읍')).toBeInTheDocument()
    expect(screen.getByText('바닷가 · 해안 0.4km')).toBeInTheDocument()
  })
  it('tag: 라벨 + `+N곳 더` 버튼', async () => {
    const onMore = vi.fn()
    render(
      <GraphNode
        kind="tag"
        label="카페 많음 · 7"
        color="var(--color-explore-group-work)"
        more={2}
        onMore={onMore}
      />,
    )
    expect(screen.getByText('카페 많음 · 7')).toBeInTheDocument()
    await userEvent.click(screen.getByRole('button', { name: '+2곳 더' }))
    expect(onMore).toHaveBeenCalled()
  })
})

describe('PlacePin', () => {
  it('선택되면 이름 말풍선, 흐림은 opacity-faded', () => {
    const { container, rerender } = render(
      <PlacePin name="소돌 카페" color="red" icon={Laptop} dimmed />,
    )
    expect(container.firstElementChild).toHaveClass('opacity-faded')
    rerender(<PlacePin name="소돌 카페" color="red" icon={Laptop} selected />)
    expect(container.querySelector('[data-selected]')).toHaveTextContent('소돌 카페')
  })
})

describe('pinDom', () => {
  it('핀은 흐림 클래스, 클러스터는 개수', () => {
    expect(pinElement('a', 'var(--color-explore-group-work)', true).className).toContain(
      'opacity-faded',
    )
    expect(pinElement('a', 'var(--color-explore-group-work)', false).className).not.toContain(
      'opacity-faded',
    )
    expect(clusterElement(12).textContent).toBe('12')
  })
})
