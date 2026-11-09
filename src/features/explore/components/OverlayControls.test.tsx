import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import ExploreSkeleton from '@/features/explore/components/ExploreSkeleton'
import MapLegend from '@/features/explore/components/MapLegend'
import OffscreenChips from '@/features/explore/components/OffscreenChips'
import PathBar from '@/features/explore/components/PathBar'
import ZoomStage from '@/features/explore/components/ZoomStage'
import { indexGraph } from '@/features/explore/indexGraph'
import { breadcrumbAt } from '@/features/explore/view'
import { exploreGraphMock } from '@/mocks/explore/graph'

const index = indexGraph(exploreGraphMock)
const tag = (id: string) => index.tagById.get(id)!

describe('PathBar', () => {
  it('도 › 시군구 › 행정동, 누르면 onPick(level, id)', async () => {
    const onPick = vi.fn()
    const jumunjin = index.dongById.get('5115025000')!
    render(<PathBar crumbs={breadcrumbAt(index, jumunjin.center!, 12)} onPick={onPick} />)
    const nav = screen.getByRole('navigation', { name: '경로' })
    expect(nav).toHaveTextContent('강원특별자치도강릉시주문진읍')
    await userEvent.click(screen.getByRole('button', { name: '강릉시' }))
    expect(onPick).toHaveBeenCalledWith('sigungu', '51150')
  })
})

describe('ZoomStage', () => {
  it('현재 단계 표시, 누르면 onPick', async () => {
    const onPick = vi.fn()
    render(<ZoomStage stage="sigungu" onPick={onPick} />)
    expect(screen.getByRole('button', { name: '시군구 9~10', pressed: true })).toBeInTheDocument()
    await userEvent.click(screen.getByRole('button', { name: '장소 14+' }))
    expect(onPick).toHaveBeenCalledWith('place')
  })
})

describe('OffscreenChips', () => {
  it('도 이름 + 개수, 누르면 그 범위로', async () => {
    const onPick = vi.fn()
    const bounds = { west: 126, south: 35, east: 127, north: 36 }
    render(
      <OffscreenChips
        groups={[{ provinceId: '52', name: '전북특별자치도', short: '전북', count: 8, bounds }]}
        onPick={onPick}
      />,
    )
    await userEvent.click(screen.getByRole('button', { name: '전북특별자치도 8곳' }))
    expect(onPick).toHaveBeenCalledWith(bounds)
  })
})

describe('MapLegend', () => {
  it('tags: 고른 태그 점 + 경계 설명 + 데이터 한계', () => {
    render(<MapLegend mode="tags" tags={[tag('cafe'), tag('beach')]} />)
    expect(screen.getByText('카페 많음')).toBeInTheDocument()
    expect(screen.getByText('경계 = 모두 있음')).toBeInTheDocument()
    expect(screen.getByText(/한국관광공사 등록 장소 기준/)).toBeInTheDocument()
  })
  it('dong: 선택한 동 + 가지 (branch 만)', () => {
    render(<MapLegend mode="dong" tags={[tag('coast'), tag('cafe')]} />)
    expect(screen.getByText('선택한 동 (바깥은 어둡게)')).toBeInTheDocument()
    expect(screen.getByText('카페 많음 가지')).toBeInTheDocument()
    expect(screen.queryByText('바닷가 가지')).not.toBeInTheDocument()
  })
})

describe('ExploreSkeleton', () => {
  it('지도 자리에 로딩 문구', () => {
    render(<ExploreSkeleton part="map" />)
    expect(screen.getByText('탐색 데이터를 불러오는 중이에요')).toBeInTheDocument()
  })
})
