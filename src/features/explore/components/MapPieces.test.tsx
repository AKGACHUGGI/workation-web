import type { ReactNode } from 'react'
import { describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import BackToAllButton from '@/features/explore/components/BackToAllButton'
import DongPin from '@/features/explore/components/DongPin'
import DongPinLayer from '@/features/explore/components/DongPinLayer'
import MapLegend from '@/features/explore/components/MapLegend'
import MapSkeleton from '@/features/explore/components/MapSkeleton'
import PinSkeletonLayer from '@/features/explore/components/PinSkeletonLayer'
import PinsErrorCard from '@/features/explore/components/PinsErrorCard'
import { pinsMock } from '@/mocks/explore/pins'

vi.mock('@vis.gl/react-google-maps', () => ({
  AdvancedMarker: ({
    children,
    onClick,
    title,
  }: {
    children: ReactNode
    onClick?: () => void
    title?: string
  }) => (
    <div data-testid="marker" title={title} onClick={onClick}>
      {children}
    </div>
  ),
}))

const pins = pinsMock('51150')!.dongs
const jumunjin = pins.find((p) => p.id === '5115025000')!

describe('DongPin', () => {
  it('이름 + 태그 아이콘 최대 2개', () => {
    const { container } = render(<DongPin pin={jumunjin} state="default" onHover={() => {}} />)
    expect(screen.getByText('주문진읍')).toBeInTheDocument()
    expect(
      [...container.querySelectorAll('[data-tag]')].map((el) => el.getAttribute('data-tag')),
    ).toEqual(['coast', 'cafe'])
  })
  it('상태를 data-state 로, 마우스 올리기·내리기 → onHover', () => {
    const onHover = vi.fn()
    const { container } = render(<DongPin pin={jumunjin} state="selected" onHover={onHover} />)
    const pin = container.querySelector('[data-state]')!
    expect(pin).toHaveAttribute('data-state', 'selected')
    fireEvent.mouseEnter(pin)
    fireEvent.mouseLeave(pin)
    expect(onHover.mock.calls).toEqual([['5115025000'], [null]])
  })
  it('태그가 없으면 아이콘 없이 이름만', () => {
    const { container } = render(
      <DongPin pin={{ ...jumunjin, tags: [] }} state="default" onHover={() => {}} />,
    )
    expect(container.querySelectorAll('[data-tag]')).toHaveLength(0)
  })
})

describe('DongPinLayer', () => {
  it('핀 21개, 클릭 → onPickDong, 선택·hover 상태 전달', async () => {
    const onPickDong = vi.fn()
    const { container } = render(
      <DongPinLayer
        pins={pins}
        hoveredDong="5115037000"
        selectedDong="5115025000"
        onPickDong={onPickDong}
        onHoverDong={() => {}}
      />,
    )
    expect(screen.getAllByTestId('marker')).toHaveLength(21)
    expect(container.querySelectorAll('[data-state="selected"]')).toHaveLength(1)
    expect(container.querySelectorAll('[data-state="hover"]')).toHaveLength(1)
    await userEvent.click(screen.getByTitle('주문진읍'))
    expect(onPickDong).toHaveBeenCalledWith('5115025000')
  })
})

describe('PinSkeletonLayer', () => {
  it('스켈레톤 수 = 위치 수, 회색 알약', () => {
    const { container } = render(
      <PinSkeletonLayer
        skeletons={[
          { id: 'a', position: { lat: 37, lng: 128 } },
          { id: 'b', position: { lat: 37.1, lng: 128.1 } },
        ]}
      />,
    )
    expect(container.querySelectorAll('[data-skeleton-pin]')).toHaveLength(2)
    expect(container.querySelector('[data-skeleton-pin]')).toHaveClass(
      'bg-explore-skeleton-map',
      'skeleton-shine',
    )
  })
})

describe('MapSkeleton', () => {
  it('aria-busy + 숨김 문구, 확대 버튼·범례 자리', () => {
    const { container } = render(<MapSkeleton />)
    expect(container.firstChild).toHaveAttribute('aria-busy', 'true')
    expect(screen.getByText('불러오는 중')).toHaveClass('sr-only')
    expect(container.querySelectorAll('.bg-explore-skeleton-map')).toHaveLength(2)
  })
})

describe('MapLegend', () => {
  it('⓪: 히트맵 색 + 누르면 확대', () => {
    render(<MapLegend stage="overview" tags={[]} />)
    expect(screen.getByText('종합 점수 (홈과 같은 색)')).toBeInTheDocument()
    expect(screen.getByText('누르면 확대')).toBeInTheDocument()
    expect(screen.queryByText('핀 아이콘: 한국관광공사 동 태그 기준')).not.toBeInTheDocument()
  })
  it('①: 핀·선택·경계 + 아이콘 뜻 + 관광공사 출처', () => {
    render(<MapLegend stage="pins" tags={['cafe', 'beach']} />)
    expect(screen.getByText('동네 핀 (아이콘 = 대표 태그)')).toBeInTheDocument()
    expect(screen.getByText('선택 중')).toBeInTheDocument()
    expect(screen.getByText('행정동 경계')).toBeInTheDocument()
    expect(screen.getByText('카페')).toBeInTheDocument()
    expect(screen.getByText('해수욕장')).toBeInTheDocument()
    expect(screen.getByText('핀 아이콘: 한국관광공사 동 태그 기준')).toBeInTheDocument()
  })
})

describe('오버레이', () => {
  it('전체 지도로 → onClick', async () => {
    const onClick = vi.fn()
    render(<BackToAllButton onClick={onClick} />)
    await userEvent.click(screen.getByRole('button', { name: '전체 지도로' }))
    expect(onClick).toHaveBeenCalled()
  })
  it('전체 지도로: 화살표 아이콘만, 글자는 툴팁으로', () => {
    render(<BackToAllButton onClick={() => {}} />)
    const btn = screen.getByRole('button', { name: '전체 지도로' })
    expect(btn).toHaveAttribute('title', '전체 지도로')
    expect(btn).toHaveTextContent(/^$/)
  })
  it('핀 오류 카드: 문구 + 다시 시도', async () => {
    const onRetry = vi.fn()
    render(<PinsErrorCard onRetry={onRetry} />)
    expect(screen.getByRole('alert')).toHaveTextContent('동네 목록을 불러오지 못했어요.')
    await userEvent.click(screen.getByRole('button', { name: '다시 시도' }))
    expect(onRetry).toHaveBeenCalled()
  })
})
