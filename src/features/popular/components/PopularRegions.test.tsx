import { describe, expect, it } from 'vitest'
import { screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import renderWithRouter from '@/test/renderWithRouter'
import PopularRegions from '@/features/popular/components/PopularRegions'
import { getPopularMock } from '@/mocks/popular'

const items = getPopularMock('2025-10').items

function cardTitles() {
  return screen.getAllByRole('link').map((a) => a.textContent ?? '')
}

describe('PopularRegions', () => {
  it('기본 정렬 즐겨찾기순: 첫 카드 고성군, 배지 "즐겨찾기 1위"', () => {
    renderWithRouter(
      <PopularRegions items={items} month="2025-10" hoverId={null} onHover={() => {}} />,
      {
        route: '/?month=2025-10',
      },
    )
    expect(screen.getByRole('heading', { name: '인기 지역 12곳' })).toBeInTheDocument()
    expect(cardTitles()[0]).toContain('고성군')
    expect(screen.getByText('즐겨찾기 1위')).toBeInTheDocument()
  })

  it('정렬 변경 → 조회 많은 순 첫 카드 제주시, URL sort=views', async () => {
    renderWithRouter(
      <PopularRegions items={items} month="2025-10" hoverId={null} onHover={() => {}} />,
      {
        route: '/?month=2025-10',
      },
    )
    await userEvent.click(screen.getByRole('button', { name: /정렬/ }))
    await userEvent.click(screen.getByRole('option', { name: '조회 많은 순' }))
    expect(screen.getByTestId('location')).toHaveTextContent('sort=views')
    expect(cardTitles()[0]).toContain('제주시')
    expect(screen.getByText('조회 1위')).toBeInTheDocument()
  })

  it('지형 필터로 0개면 빈 상태', () => {
    renderWithRouter(
      <PopularRegions
        items={items.map((i) => ({ ...i, terrain: ['coast'] }))}
        month="2025-10"
        hoverId={null}
        onHover={() => {}}
      />,
      { route: '/?terrain=city' },
    )
    expect(screen.getByText('조건에 맞는 지역이 없어요')).toBeInTheDocument()
  })

  it('카드 hover 시 onHover(id)', async () => {
    const calls: (string | null)[] = []
    renderWithRouter(
      <PopularRegions
        items={items}
        month="2025-10"
        hoverId={null}
        onHover={(id) => calls.push(id)}
      />,
    )
    const first = screen.getAllByRole('link')[0]
    await userEvent.hover(first)
    expect(calls[0]).toBe('51820')
    await userEvent.unhover(first)
    expect(calls.at(-1)).toBeNull()
  })

  it('직접 설정이면 토글이 펼쳐진다', async () => {
    renderWithRouter(
      <PopularRegions items={items} month="2025-10" hoverId={null} onHover={() => {}} />,
      {
        route: '/?preset=custom&metrics=quiet,crowd',
      },
    )
    const toggles = screen.getByRole('group', { name: '포함 지표' })
    expect(within(toggles).getByRole('button', { name: '동네 조용함' })).toHaveAttribute(
      'aria-pressed',
      'true',
    )
  })
})
