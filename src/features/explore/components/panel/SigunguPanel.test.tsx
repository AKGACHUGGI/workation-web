import { describe, expect, it, vi } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import GuidePanel from '@/features/explore/components/panel/GuidePanel'
import SelectionCard from '@/features/explore/components/panel/SelectionCard'
import SigunguGraphSkeleton from '@/features/explore/components/panel/SigunguGraphSkeleton'
import SigunguPanel from '@/features/explore/components/panel/SigunguPanel'
import { DEFAULT_RELATIONS, buildSigunguGraph } from '@/features/explore/sigunguGraph'
import type { RelationKey } from '@/features/explore/sigunguGraph'
import { GANGNEUNG_PINS, YEONGOK_ID } from '@/test/fixtures/explore'

const on = new Set<RelationKey>(DEFAULT_RELATIONS)
const graph = buildSigunguGraph(GANGNEUNG_PINS, on)

describe('GuidePanel', () => {
  it('⓪ 제목 + 안내', () => {
    render(<GuidePanel />)
    expect(screen.getByRole('heading', { name: '지역을 골라 보세요' })).toBeInTheDocument()
    expect(screen.getByText(/지도에서 시군구를 눌러 보세요/)).toBeInTheDocument()
  })
})

describe('SelectionCard', () => {
  it('동: 이름 · 가장 맞는 유형 점수 · 이어진 사실 · 공통 2 (강동면·경포동·사천면) · [동네 자세히 보기]', async () => {
    const onOpenDong = vi.fn()
    render(
      <SelectionCard
        graph={graph}
        pins={GANGNEUNG_PINS}
        pick={{ kind: 'dong', id: YEONGOK_ID }}
        onOpenDong={onOpenDong}
      />,
    )
    const card = screen.getByRole('region', { name: '연곡면' })
    expect(card).toHaveTextContent('몰입형 50')
    // 순서는 파트 A 의 링크 생성 순서를 따르므로 집합으로 비교
    expect(
      within(card)
        .getAllByRole('listitem')
        .map((li) => li.textContent)
        .sort(),
    ).toEqual(['관광지', '몰입형', '바닷가'])
    expect(card).toHaveTextContent('공통 2')
    expect(card).toHaveTextContent('강동면 · 경포동 · 사천면')
    await userEvent.click(within(card).getByRole('button', { name: '동네 자세히 보기' }))
    expect(onOpenDong).toHaveBeenCalledWith(YEONGOK_ID)
  })
  it('사실: "바닷가 · 이어진 동 10곳" + 동 목록, 버튼 없음', () => {
    render(
      <SelectionCard
        graph={graph}
        pins={GANGNEUNG_PINS}
        pick={{ kind: 'fact', id: 'coast' }}
        onOpenDong={() => {}}
      />,
    )
    const card = screen.getByRole('region', { name: '바닷가' })
    expect(card).toHaveTextContent('바닷가 · 이어진 동 10곳')
    expect(card).toHaveTextContent('주문진읍')
    expect(within(card).queryByRole('button')).not.toBeInTheDocument()
  })
  it('그래프에서 빠진 노드(관계 끔)는 카드 없음', () => {
    const { container } = render(
      <SelectionCard
        graph={graph}
        pins={GANGNEUNG_PINS}
        pick={{ kind: 'fact', id: 'quiet:B' }}
        onOpenDong={() => {}}
      />,
    )
    expect(container).toBeEmptyDOMElement()
  })
})

describe('SigunguGraphSkeleton', () => {
  it('경계 파일 동 수만큼 회색 원, 선 없음, aria-busy', () => {
    const ids = GANGNEUNG_PINS.map((p) => p.id)
    render(<SigunguGraphSkeleton ids={ids} />)
    const sk = screen.getByTestId('graph-skeleton')
    expect(sk).toHaveAttribute('aria-busy', 'true')
    expect(sk.querySelectorAll('circle[data-skeleton-node]')).toHaveLength(21)
    expect(sk.querySelectorAll('line')).toHaveLength(0)
  })
})

describe('SigunguPanel', () => {
  const base = {
    name: '강릉시',
    province: '강원특별자치도',
    pins: GANGNEUNG_PINS,
    relsOn: on,
    onToggleRel: vi.fn(),
    pick: null,
    onPick: vi.fn(),
    hoveredDong: null,
    onHoverDong: vi.fn(),
    onOpenDong: vi.fn(),
  }
  it('헤더 · 관계 칩 · 그래프 · 출처, 아래 범례 없음, 선택 없으면 카드 없음', () => {
    render(<SigunguPanel {...base} />)
    expect(screen.getByRole('heading', { level: 2, name: '강릉시' })).toBeInTheDocument()
    expect(screen.getByText('강원특별자치도 · 행정동 21곳')).toBeInTheDocument()
    expect(screen.getByRole('group', { name: '관계' })).toBeInTheDocument()
    expect(screen.getByRole('group', { name: '강릉시 지식그래프' })).toBeInTheDocument()
    expect(screen.queryByText(/원 크기/)).not.toBeInTheDocument()
    expect(screen.queryByText(/1위 유형|가까움/)).not.toBeInTheDocument()
    expect(screen.getByText(/생활권 = 생활권 지수 0.7 이상/)).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: '동네 자세히 보기' })).not.toBeInTheDocument()
  })
  it('pick 이 있으면 카드', () => {
    render(<SigunguPanel {...base} pick={{ kind: 'dong', id: YEONGOK_ID }} />)
    expect(screen.getByRole('button', { name: '동네 자세히 보기' })).toBeInTheDocument()
  })
})
