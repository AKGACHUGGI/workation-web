import { describe, expect, it, vi } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import GuidePanel from '@/features/explore/components/panel/GuidePanel'
import SelectionCard from '@/features/explore/components/panel/SelectionCard'
import SigunguGraphSkeleton from '@/features/explore/components/panel/SigunguGraphSkeleton'
import SigunguPanel from '@/features/explore/components/panel/SigunguPanel'
import { GANGNEUNG_PINS, WANGSAN_ID, YEONGOK_ID } from '@/test/fixtures/explore'

const HINT = '뚜렷한 유형이 없는 동네예요. 눌러서 자세히 보세요.'

describe('GuidePanel', () => {
  it('⓪ 제목 + 안내', () => {
    render(<GuidePanel />)
    expect(screen.getByRole('heading', { name: '지역을 골라 보세요' })).toBeInTheDocument()
    expect(screen.getByText(/지도에서 시군구를 눌러 보세요/)).toBeInTheDocument()
  })
})

describe('SelectionCard', () => {
  const card = (pick: Parameters<typeof SelectionCard>[0]['pick'], onOpenDong = vi.fn()) =>
    render(<SelectionCard pins={GANGNEUNG_PINS} pick={pick} onOpenDong={onOpenDong} />)

  it('동: 이름 · 대표 유형 점수 · 핀 사실 · 공통 3 (강동면·사천면·송정동) · [동네 자세히 보기]', async () => {
    const onOpenDong = vi.fn()
    card({ kind: 'dong', id: YEONGOK_ID }, onOpenDong)
    const el = screen.getByRole('region', { name: '연곡면' })
    expect(el).toHaveTextContent('몰입형 50')
    expect(
      within(el)
        .getAllByRole('listitem')
        .map((li) => li.textContent),
    ).toEqual(['몰입형', '바닷가', '관광지', '조용함 A', '저녁 활기 B'])
    expect(el).toHaveTextContent('공통 3')
    expect(el).toHaveTextContent('강동면 · 사천면 · 송정동')
    await userEvent.click(within(el).getByRole('button', { name: '동네 자세히 보기' }))
    expect(onOpenDong).toHaveBeenCalledWith(YEONGOK_ID)
  })
  it('대표 유형 없는 동(왕산면): "뚜렷한 유형 없음" + [동네 자세히 보기]', () => {
    card({ kind: 'dong', id: WANGSAN_ID })
    const el = screen.getByRole('region', { name: '왕산면' })
    expect(el).toHaveTextContent('뚜렷한 유형 없음')
    expect(within(el).getByRole('button', { name: '동네 자세히 보기' })).toBeInTheDocument()
  })
  it('유형: "로컬살이형 · 동 10곳" + 동 목록, 버튼 없음', () => {
    card({ kind: 'type', id: 'type:로컬살이형' })
    const el = screen.getByRole('region', { name: '로컬살이형' })
    expect(el).toHaveTextContent('로컬살이형 · 동 10곳')
    expect(el).toHaveTextContent('주문진읍')
    expect(within(el).queryByRole('button')).not.toBeInTheDocument()
  })
  it('없는 동·유형이면 카드 없음', () => {
    const { container } = card({ kind: 'dong', id: '0000000000' })
    expect(container).toBeEmptyDOMElement()
  })
})

describe('SigunguGraphSkeleton', () => {
  it('가운데 원 1 + 동 수만큼 링 위 회색 원, 선 없음, aria-busy', () => {
    render(<SigunguGraphSkeleton ids={GANGNEUNG_PINS.map((p) => p.id)} />)
    const sk = screen.getByTestId('graph-skeleton')
    expect(sk).toHaveAttribute('aria-busy', 'true')
    expect(sk.querySelectorAll('circle[data-skeleton-center]')).toHaveLength(1)
    expect(sk.querySelectorAll('circle[data-skeleton-node]')).toHaveLength(21)
    expect(sk.querySelectorAll('line')).toHaveLength(0)
  })
})

describe('SigunguPanel', () => {
  const base = {
    name: '강릉시',
    province: '강원특별자치도',
    pins: GANGNEUNG_PINS,
    pick: null,
    onPick: vi.fn(),
    hoveredDong: null,
    onHoverDong: vi.fn(),
    onOpenDong: vi.fn(),
  }
  it('헤더 · 범례 한 줄 · 그래프 · 유형 없음 안내 · 출처, 관계 칩 없음, 선택 없으면 카드 없음', () => {
    render(<SigunguPanel {...base} />)
    expect(screen.getByRole('heading', { level: 2, name: '강릉시' })).toBeInTheDocument()
    expect(screen.getByText('강원특별자치도 · 행정동 21곳')).toBeInTheDocument()
    const legend = screen.getByRole('group', { name: '그래프 범례' })
    expect(legend).toHaveTextContent('워케이션 유형')
    expect(legend).toHaveTextContent('바닷가')
    expect(legend).toHaveTextContent('뚜렷한 유형 없음')
    expect(screen.queryByRole('group', { name: '관계' })).not.toBeInTheDocument()
    expect(screen.getByRole('group', { name: '강릉시 지식그래프' })).toBeInTheDocument()
    expect(screen.getByText(HINT)).toBeInTheDocument()
    expect(screen.getByText(/생활권 = 생활권 지수 0.7 이상/)).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: '동네 자세히 보기' })).not.toBeInTheDocument()
  })
  it('유형 없는 동이 없으면 안내 문구도 없다', () => {
    render(<SigunguPanel {...base} pins={GANGNEUNG_PINS.filter((p) => p.topType !== null)} />)
    expect(screen.queryByText(HINT)).not.toBeInTheDocument()
  })
  it('pick 이 있으면 카드', () => {
    render(<SigunguPanel {...base} pick={{ kind: 'dong', id: YEONGOK_ID }} />)
    expect(screen.getByRole('button', { name: '동네 자세히 보기' })).toBeInTheDocument()
  })
})
