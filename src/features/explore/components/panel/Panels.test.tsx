import { describe, expect, it, vi } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import RangeSummary from '@/features/explore/components/panel/RangeSummary'
import SelectedTagsCard from '@/features/explore/components/panel/SelectedTagsCard'
import { indexGraph } from '@/features/explore/indexGraph'
import { matchDongs, splitByView } from '@/features/explore/match'
import { summarizeTags } from '@/features/explore/summary'
import { DEFAULT_BOUNDS } from '@/features/explore/view'
import { exploreGraphMock } from '@/mocks/explore/graph'

const index = indexGraph(exploreGraphMock)
const rows = summarizeTags(index, DEFAULT_BOUNDS)

describe('⓪ RangeSummary', () => {
  it('안내 카드 + 묶음별 막대, 행을 누르면 onToggle', async () => {
    const onToggle = vi.fn()
    render(<RangeSummary rows={rows} selected={[]} onToggle={onToggle} />)
    expect(screen.getByRole('heading', { name: '이 지도 범위 요약' })).toBeInTheDocument()
    expect(screen.getByText('위쪽 태그를 골라 보세요')).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: '일하기' })).toBeInTheDocument()
    const cafe = screen.getByRole('button', { name: /카페 많음/ })
    expect(cafe).toHaveTextContent('11곳')
    await userEvent.click(cafe)
    expect(onToggle).toHaveBeenCalledWith('cafe')
  })
})

describe('① SelectedTagsCard', () => {
  const tagIds = ['cafe', 'beach']
  const any = splitByView(index, matchDongs(index, tagIds, 'any'), DEFAULT_BOUNDS).inView
  const all = any.filter((m) => m.all)

  it('제목·부제, 모두 있는 동 장소 많은 순 4개', () => {
    render(
      <SelectedTagsCard
        index={index}
        tagIds={tagIds}
        anyCount={any.length}
        allMatches={all}
        rows={rows}
        onToggle={() => {}}
        onOpenDong={() => {}}
      />,
    )
    expect(screen.getByRole('heading', { name: '선택한 태그 2개' })).toBeInTheDocument()
    expect(screen.getByText('카페 많음 + 해수욕장 · 하나라도 있는 동 14곳')).toBeInTheDocument()
    const list = screen.getByRole('list', { name: '모두 있는 동 · 장소 많은 순' })
    const items = within(list).getAllByRole('button')
    expect(items.map((b) => b.querySelector('[data-name]')?.textContent)).toEqual([
      '경포동',
      '송정동',
      '주문진읍',
      '영랑동',
    ])
    expect(items[2]).toHaveTextContent('카페 7')
    expect(items[2]).toHaveTextContent('해수욕장 3')
  })
  it('행 클릭 → onOpenDong, 선택 칩 클릭 → onToggle', async () => {
    const onOpenDong = vi.fn()
    const onToggle = vi.fn()
    render(
      <SelectedTagsCard
        index={index}
        tagIds={tagIds}
        anyCount={14}
        allMatches={all}
        rows={rows}
        onToggle={onToggle}
        onOpenDong={onOpenDong}
      />,
    )
    await userEvent.click(screen.getByRole('button', { name: /주문진읍/ }))
    expect(onOpenDong).toHaveBeenCalledWith('5115025000')
    await userEvent.click(screen.getByRole('button', { name: '해수욕장 선택 해제' }))
    expect(onToggle).toHaveBeenCalledWith('beach')
  })
  it('모두 있는 동이 없으면 안내 문구', () => {
    render(
      <SelectedTagsCard
        index={index}
        tagIds={['island', 'cafe']}
        anyCount={11}
        allMatches={[]}
        rows={rows}
        onToggle={() => {}}
        onOpenDong={() => {}}
      />,
    )
    expect(screen.getByText('고른 태그를 모두 가진 동이 이 범위에 없어요')).toBeInTheDocument()
  })
})
