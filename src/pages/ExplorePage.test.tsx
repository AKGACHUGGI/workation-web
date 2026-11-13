import { describe, expect, it } from 'vitest'
import { screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import ExplorePage from '@/pages/ExplorePage'
import renderWithRouter from '@/test/renderWithRouter'
import { YEONGOK_ID } from '@/test/fixtures/explore'

const location = () => screen.getByTestId('location').textContent

describe('ExplorePage', () => {
  it('⓪: 안내 패널', () => {
    renderWithRouter(<ExplorePage />, { route: '/explore' })
    expect(screen.getByRole('heading', { name: '지역을 골라 보세요' })).toBeInTheDocument()
  })

  it('①: 동 노드 클릭 → 카드만 열리고 dong 은 그대로, [동네 자세히 보기] → dong 갱신, ← 그래프 → 선택 유지', async () => {
    const user = userEvent.setup()
    renderWithRouter(<ExplorePage />, { route: '/explore?sgg=51150' })
    const graph = await screen.findByRole('group', { name: '강릉시 지식그래프' }, { timeout: 3000 })
    expect(graph.querySelectorAll('[data-kind="dong"]')).toHaveLength(21)
    expect(screen.getByText('강원특별자치도 · 행정동 21곳')).toBeInTheDocument()

    await user.click(within(graph).getByRole('button', { name: '연곡면' }))
    expect(screen.getByRole('region', { name: '연곡면' })).toHaveTextContent('공통 3')
    expect(location()).toBe('/explore?sgg=51150')

    await user.click(screen.getByRole('button', { name: '동네 자세히 보기' }))
    expect(location()).toContain(`dong=${YEONGOK_ID}`)
    expect(
      await screen.findByRole('heading', { level: 2, name: '연곡면' }, { timeout: 3000 }),
    ).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: '강릉시 그래프로' }))
    expect(location()).toBe('/explore?sgg=51150')
    expect(await screen.findByRole('region', { name: '연곡면' })).toHaveTextContent('공통 3')
  })

  it('①: 조용함 등급 칩을 켜면 조용함 사실 노드가 생기고, 끄면 빠진다', async () => {
    const user = userEvent.setup()
    renderWithRouter(<ExplorePage />, { route: '/explore?sgg=51150' })
    const graph = await screen.findByRole('group', { name: '강릉시 지식그래프' }, { timeout: 3000 })
    const quietNodes = () => within(graph).queryAllByRole('button', { name: /^사실 조용함/ })
    expect(quietNodes()).toHaveLength(0)
    const chip = within(screen.getByRole('group', { name: '관계' })).getByRole('button', {
      name: '조용함 등급',
    })
    await user.click(chip)
    expect(chip).toHaveAttribute('aria-pressed', 'true')
    expect(quietNodes().length).toBeGreaterThan(0)
    await user.click(chip)
    expect(quietNodes()).toHaveLength(0)
  })

  it('①: 그래프 동 노드 hover → 페이지 hoveredDong → 그래프 미리 강조', async () => {
    const user = userEvent.setup()
    renderWithRouter(<ExplorePage />, { route: '/explore?sgg=51150' })
    const graph = await screen.findByRole('group', { name: '강릉시 지식그래프' }, { timeout: 3000 })
    await user.hover(within(graph).getByRole('button', { name: '주문진읍' }))
    expect(within(graph).getByRole('button', { name: '강남동' })).toHaveAttribute(
      'data-dim',
      'true',
    )
    await user.unhover(within(graph).getByRole('button', { name: '주문진읍' }))
    expect(within(graph).getByRole('button', { name: '강남동' })).not.toHaveAttribute('data-dim')
  })
})
