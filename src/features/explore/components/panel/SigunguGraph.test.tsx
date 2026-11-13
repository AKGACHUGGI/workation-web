import { describe, expect, it, vi } from 'vitest'
import { act, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import SigunguGraph from '@/features/explore/components/panel/SigunguGraph'
import type { GraphPick } from '@/features/explore/components/panel/SigunguGraph'
import { GRAPH_H, GRAPH_W } from '@/features/explore/components/panel/panelLayout'
import { radialLayout } from '@/features/explore/radialLayout'
import { buildSigunguGraph } from '@/features/explore/sigunguGraph'
import { GANGNEUNG_PINS, JUMUNJIN_ID, YEONGOK_ID } from '@/test/fixtures/explore'

const graph = buildSigunguGraph('강릉시', GANGNEUNG_PINS)
const layout = radialLayout(GANGNEUNG_PINS, { w: GRAPH_W, h: GRAPH_H })

const setup = (over: { pick?: GraphPick | null; hoveredDong?: string | null } = {}) => {
  const props = {
    name: '강릉시',
    graph,
    layout,
    pick: over.pick ?? null,
    onPick: vi.fn(),
    hoveredDong: over.hoveredDong ?? null,
    onHoverDong: vi.fn(),
  }
  render(<SigunguGraph {...props} />)
  const svg = screen.getByRole('group', { name: '강릉시 지식그래프' })
  const node = (name: string) => within(svg).getByRole('button', { name })
  return { props, svg, node }
}

describe('SigunguGraph', () => {
  it('가운데 시군구(버튼 아님) · 유형 3 · 동 21, 점선 5, 바닷가 표시 없음', () => {
    const { svg } = setup()
    expect(svg.querySelectorAll('[data-kind="sigungu"]')).toHaveLength(1)
    expect(within(svg).getByText('강릉시')).toBeInTheDocument()
    expect(within(svg).queryByRole('button', { name: '강릉시' })).not.toBeInTheDocument()
    const types = [...svg.querySelectorAll('[data-kind="type"]')]
    expect(types.map((n) => n.getAttribute('aria-label'))).toEqual([
      '몰입형',
      '네트워킹형',
      '로컬살이형',
    ])
    expect(svg.querySelectorAll('[data-kind="dong"]')).toHaveLength(21)
    expect(svg).not.toHaveTextContent('🌊')
    expect(svg.querySelectorAll('line[data-dashed]')).toHaveLength(5)
  })

  it('Tab 순서 = 유형 → 동, Enter 로 선택', async () => {
    const { svg, props, node } = setup()
    const order = [...svg.querySelectorAll('[role="button"]')].map((n) =>
      n.getAttribute('aria-label'),
    )
    expect(order.slice(0, 4)).toEqual(['몰입형', '네트워킹형', '로컬살이형', '강남동'])
    act(() => (node('몰입형') as unknown as SVGElement).focus())
    await userEvent.keyboard('{Enter}')
    expect(props.onPick).toHaveBeenLastCalledWith({ kind: 'type', id: 'type:몰입형' })
  })

  it('클릭: 동 → dong, 유형 → type, 시군구·빈 곳 → null', async () => {
    const { svg, props, node } = setup()
    await userEvent.click(node('연곡면'))
    expect(props.onPick).toHaveBeenLastCalledWith({ kind: 'dong', id: YEONGOK_ID })
    await userEvent.click(node('로컬살이형'))
    expect(props.onPick).toHaveBeenLastCalledWith({ kind: 'type', id: 'type:로컬살이형' })
    await userEvent.click(svg.querySelector('[data-kind="sigungu"]')!)
    expect(props.onPick).toHaveBeenLastCalledWith(null)
    expect(props.onPick).toHaveBeenCalledTimes(3) // 시군구 클릭은 빈 곳 클릭으로 한 번 더 번지지 않는다
    await userEvent.click(svg)
    expect(props.onPick).toHaveBeenLastCalledWith(null)
  })

  it('동 선택 → 그 동과 그 유형만 진하게', () => {
    const { node } = setup({ pick: { kind: 'dong', id: YEONGOK_ID } })
    expect(node('연곡면')).not.toHaveAttribute('data-dim')
    expect(node('몰입형')).not.toHaveAttribute('data-dim')
    expect(node('강남동')).toHaveAttribute('data-dim', 'true')
    expect(node('로컬살이형')).toHaveAttribute('data-dim', 'true')
  })

  it('유형 선택 → 그 유형의 동만 진하게', () => {
    const { node } = setup({ pick: { kind: 'type', id: 'type:로컬살이형' } })
    expect(node('주문진읍')).not.toHaveAttribute('data-dim')
    expect(node('연곡면')).toHaveAttribute('data-dim', 'true')
  })

  it('지도 핀 hover(hoveredDong) → 미리 강조, 노드 hover → onHoverDong', async () => {
    const { props, node } = setup({ hoveredDong: JUMUNJIN_ID })
    expect(node('주문진읍')).not.toHaveAttribute('data-dim')
    expect(node('연곡면')).toHaveAttribute('data-dim', 'true')
    await userEvent.hover(node('연곡면'))
    expect(props.onHoverDong).toHaveBeenLastCalledWith(YEONGOK_ID)
    await userEvent.unhover(node('연곡면'))
    expect(props.onHoverDong).toHaveBeenLastCalledWith(null)
  })
})
