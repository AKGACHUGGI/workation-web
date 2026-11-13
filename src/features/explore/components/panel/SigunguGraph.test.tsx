import { describe, expect, it, vi } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import RelationChips from '@/features/explore/components/panel/RelationChips'
import SigunguGraph from '@/features/explore/components/panel/SigunguGraph'
import type { GraphPick } from '@/features/explore/components/panel/SigunguGraph'
import { RELATIONS, buildSigunguGraph } from '@/features/explore/sigunguGraph'
import { GANGNEUNG_PINS, JUMUNJIN_ID, YEONGOK_ID } from '@/test/fixtures/explore'

const on = new Set(RELATIONS.filter((r) => r.defaultOn).map((r) => r.key))
const graph = buildSigunguGraph(GANGNEUNG_PINS, on)

const setup = (over: { pick?: GraphPick | null; hoveredDong?: string | null } = {}) => {
  const props = {
    name: '강릉시',
    graph,
    pick: over.pick ?? null,
    onPick: vi.fn(),
    hoveredDong: over.hoveredDong ?? null,
    onHoverDong: vi.fn(),
  }
  render(<SigunguGraph {...props} />)
  const svg = screen.getByRole('group', { name: '강릉시 지식그래프' })
  return { props, svg }
}

describe('RelationChips', () => {
  it('관계 5개, 기본 켬 3개(1위 유형·가까움·생활), 누르면 onToggle', async () => {
    const onToggle = vi.fn()
    render(<RelationChips on={on} onToggle={onToggle} />)
    const chips = within(screen.getByRole('group', { name: '관계' })).getAllByRole('button')
    expect(chips).toHaveLength(5)
    expect(chips.map((c) => c.getAttribute('aria-pressed'))).toEqual(
      RELATIONS.map((r) => String(r.defaultOn)),
    )
    await userEvent.click(chips[3])
    expect(onToggle).toHaveBeenCalledWith(RELATIONS[3].key)
  })
})

describe('SigunguGraph', () => {
  it('동 노드 21개 + 켜진 관계의 사실 노드, 시군구 노드 없음', () => {
    const { svg } = setup()
    expect(svg.querySelectorAll('[data-kind="dong"]')).toHaveLength(21)
    expect(svg.querySelectorAll('[data-kind="fact"]')).toHaveLength(graph.nodes.length - 21)
    expect(within(svg).queryByRole('button', { name: '강릉시' })).not.toBeInTheDocument()
  })

  it('동 노드 클릭 → onPick(dong), 사실 노드 클릭 → onPick(fact), 빈 곳 클릭 → onPick(null)', async () => {
    const { svg, props } = setup()
    await userEvent.click(within(svg).getByRole('button', { name: '연곡면' }))
    expect(props.onPick).toHaveBeenLastCalledWith({ kind: 'dong', id: YEONGOK_ID })
    await userEvent.click(within(svg).getByRole('button', { name: '사실 바닷가' }))
    expect(props.onPick).toHaveBeenLastCalledWith({ kind: 'fact', id: 'coast' })
    await userEvent.click(svg)
    expect(props.onPick).toHaveBeenLastCalledWith(null)
  })

  it('동 선택 → 그 동과 이어진 사실만 진하게, 나머지 흐림', () => {
    const { svg } = setup({ pick: { kind: 'dong', id: YEONGOK_ID } })
    const node = (name: string) => within(svg).getByRole('button', { name })
    expect(node('연곡면')).not.toHaveAttribute('data-dim')
    expect(node('사실 바닷가')).not.toHaveAttribute('data-dim')
    expect(node('사실 관광지')).not.toHaveAttribute('data-dim')
    expect(node('강남동')).toHaveAttribute('data-dim', 'true')
    expect(node('사실 생활권')).toHaveAttribute('data-dim', 'true')
  })

  it('사실 선택 → 그 사실을 가진 동만 진하게', () => {
    const { svg } = setup({ pick: { kind: 'fact', id: 'coast' } })
    const node = (name: string) => within(svg).getByRole('button', { name })
    expect(node('주문진읍')).not.toHaveAttribute('data-dim')
    expect(node('강남동')).toHaveAttribute('data-dim', 'true')
  })

  it('지도 핀 hover(hoveredDong) → 그래프에서 미리 강조, 노드 hover → onHoverDong', async () => {
    const { svg, props } = setup({ hoveredDong: JUMUNJIN_ID })
    expect(within(svg).getByRole('button', { name: '주문진읍' })).not.toHaveAttribute('data-dim')
    expect(within(svg).getByRole('button', { name: '연곡면' })).toHaveAttribute('data-dim', 'true')
    await userEvent.hover(within(svg).getByRole('button', { name: '연곡면' }))
    expect(props.onHoverDong).toHaveBeenLastCalledWith(YEONGOK_ID)
    await userEvent.unhover(within(svg).getByRole('button', { name: '연곡면' }))
    expect(props.onHoverDong).toHaveBeenLastCalledWith(null)
  })
})
