import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import MatchModeToggle from '@/features/explore/components/MatchModeToggle'
import TagBar from '@/features/explore/components/TagBar'
import { indexGraph } from '@/features/explore/indexGraph'
import { useExploreState } from '@/features/explore/useExploreState'
import { exploreGraphMock } from '@/mocks/explore/graph'
import renderWithRouter from '@/test/renderWithRouter'

const index = indexGraph(exploreGraphMock)

function Harness() {
  const s = useExploreState(index)
  return <TagBar tags={exploreGraphMock.tags} selected={s.tags} onToggle={s.toggleTag} />
}

describe('TagBar', () => {
  it('12개 칩, 묶음 사이 구분선 4개', () => {
    const { container } = render(
      <TagBar tags={exploreGraphMock.tags} selected={[]} onToggle={() => {}} />,
    )
    expect(screen.getAllByRole('button', { pressed: false })).toHaveLength(12)
    expect(container.querySelectorAll('[data-divider]')).toHaveLength(4)
  })
  it('칩 클릭 → tags 쿼리 갱신, 선택 칩은 aria-pressed', async () => {
    renderWithRouter(<Harness />, { route: '/explore' })
    await userEvent.click(screen.getByRole('button', { name: '카페 많음' }))
    await userEvent.click(screen.getByRole('button', { name: '해수욕장' }))
    expect(screen.getByTestId('location')).toHaveTextContent('/explore?tags=cafe%2Cbeach')
    expect(screen.getByRole('button', { name: '카페 많음', pressed: true })).toBeInTheDocument()
  })
  it('4번째 클릭은 토스트, URL 그대로', async () => {
    renderWithRouter(<Harness />, { route: '/explore?tags=cafe,beach,park' })
    await userEvent.click(screen.getByRole('button', { name: '서핑' }))
    // renderWithRouter 의 <output> 프로브도 role=status 라 문구로 찾는다
    expect(screen.getByText('태그는 3개까지 고를 수 있어요')).toBeInTheDocument()
    expect(screen.getByTestId('location')).toHaveTextContent('tags=cafe,beach,park')
  })
  it('disabled 면 칩을 누를 수 없다', () => {
    render(<TagBar tags={exploreGraphMock.tags} selected={[]} onToggle={() => {}} disabled />)
    expect(screen.getByRole('button', { name: '카페 많음' })).toBeDisabled()
  })
})

describe('MatchModeToggle', () => {
  it('개수를 보여주고 누르면 onChange', async () => {
    const onChange = vi.fn()
    render(<MatchModeToggle mode="any" anyCount={14} allCount={5} onChange={onChange} />)
    expect(
      screen.getByRole('tab', { name: '하나라도 있는 동 14', selected: true }),
    ).toBeInTheDocument()
    await userEvent.click(screen.getByRole('tab', { name: '모두 있는 동 5' }))
    expect(onChange).toHaveBeenCalledWith('all')
  })
})
