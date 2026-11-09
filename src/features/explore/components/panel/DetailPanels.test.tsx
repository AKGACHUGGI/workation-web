import { describe, expect, it, vi } from 'vitest'
import type { Mock } from 'vitest'
import { fireEvent, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import DongDetail from '@/features/explore/components/panel/DongDetail'
import ExplorePanel from '@/features/explore/components/panel/ExplorePanel'
import PlaceDetail from '@/features/explore/components/panel/PlaceDetail'
import { indexGraph } from '@/features/explore/indexGraph'
import { layoutBranches } from '@/features/explore/layout'
import { exploreGraphMock } from '@/mocks/explore/graph'

const index = indexGraph(exploreGraphMock)

const JUMUNJIN = '5115025000'
const jumunjin = index.dongById.get(JUMUNJIN)!

function renderDong(
  tagIds: string[],
  handlers: Partial<
    Record<'onToggle' | 'onOpenDong' | 'onOpenPlace' | 'onClose', Mock<(...args: string[]) => void>>
  > = {},
) {
  return render(
    <MemoryRouter>
      <DongDetail
        index={index}
        dong={jumunjin}
        tagIds={tagIds}
        layout={layoutBranches(index, jumunjin, tagIds)}
        onToggle={handlers.onToggle ?? vi.fn()}
        onOpenDong={handlers.onOpenDong ?? vi.fn()}
        onOpenPlace={handlers.onOpenPlace ?? vi.fn()}
        onClose={handlers.onClose ?? vi.fn()}
      />
    </MemoryRouter>,
  )
}

describe('② DongDetail', () => {
  it('이름·소속·등급·특징 칩', () => {
    renderDong(['cafe', 'beach'])
    expect(screen.getByRole('heading', { level: 2, name: /주문진읍/ })).toBeInTheDocument()
    expect(screen.getByText('강원특별자치도 · 강릉시')).toBeInTheDocument()
    expect(screen.getByLabelText('동네 조용함 S · 또래 밀도 A · 저녁 활기 B')).toBeInTheDocument()
    const traits = screen.getByRole('group', { name: '이 동네의 특징' })
    expect(
      within(traits).getByRole('button', { name: /카페 많음/, pressed: true }),
    ).toHaveTextContent('장소 7')
    expect(
      within(traits).getByRole('button', { name: /바닷가/, pressed: false }),
    ).toHaveTextContent('해안 0.4km')
  })
  it('고른 가지 태그별 장소 3개 + 모두 보기, 장소 행 → onOpenPlace', async () => {
    const onOpenPlace = vi.fn()
    renderDong(['cafe', 'beach'], { onOpenPlace })
    const cafe = screen.getByRole('region', { name: '카페 많음 · 7곳' })
    expect(
      within(cafe)
        .getAllByRole('button', { name: /카페/ })
        .filter((b) => b.dataset.place),
    ).toHaveLength(3)
    await userEvent.click(within(cafe).getByRole('button', { name: '모두 보기' }))
    expect(
      within(cafe)
        .getAllByRole('button')
        .filter((b) => b.dataset.place),
    ).toHaveLength(7)
    await userEvent.click(within(cafe).getByRole('button', { name: /주문진항 로스터리/ }))
    expect(onOpenPlace).toHaveBeenCalledWith(expect.any(String), JUMUNJIN)
  })
  it('장소 없는 고른 태그는 안내 문구', () => {
    renderDong(['island'])
    expect(screen.getByText('이 동네엔 섬 장소가 없어요')).toBeInTheDocument()
  })
  it('비슷한 동네 3개 + 겹치는 태그, 클릭 → onOpenDong', async () => {
    const onOpenDong = vi.fn()
    renderDong(['cafe'], { onOpenDong })
    const list = screen.getByRole('list', { name: '비슷한 동네' })
    const rows = within(list).getAllByRole('button')
    expect(rows).toHaveLength(3)
    expect(rows[0]).toHaveTextContent('거진읍')
    expect(rows[0]).toHaveTextContent('고성군')
    expect(rows[0]).toHaveTextContent('겹치는 태그 바닷가 · 카페 많음 · 해수욕장')
    await userEvent.click(rows[1])
    expect(onOpenDong).toHaveBeenCalledWith('5121051000')
  })
  it('하단 동네 프로필 링크와 데이터 한계 문구', () => {
    renderDong(['cafe'])
    expect(screen.getByRole('link', { name: '동네 프로필 보기 →' })).toHaveAttribute(
      'href',
      `/dongs/${JUMUNJIN}`,
    )
    expect(screen.getByText(/한국관광공사 등록 장소 기준/)).toBeInTheDocument()
  })
  it('등급이 없으면 등급 줄을 숨긴다', () => {
    const seongsan = index.dongById.get('5115031000')!
    render(
      <MemoryRouter>
        <DongDetail
          index={index}
          dong={seongsan}
          tagIds={[]}
          layout={layoutBranches(index, seongsan, [])}
          onToggle={vi.fn()}
          onOpenDong={vi.fn()}
          onOpenPlace={vi.fn()}
          onClose={vi.fn()}
        />
      </MemoryRouter>,
    )
    expect(screen.queryByText(/S 상위 25%/)).not.toBeInTheDocument()
  })
})

describe('③ PlaceDetail', () => {
  const place = exploreGraphMock.places.find((p) => p.name === '주문진항 로스터리')!

  it('이름·태그·소속 동·출처·같은 가지 3개', async () => {
    const onBackToDong = vi.fn()
    const onOpenPlace = vi.fn()
    render(
      <MemoryRouter>
        <PlaceDetail
          index={index}
          place={place}
          onBackToDong={onBackToDong}
          onOpenPlace={onOpenPlace}
        />
      </MemoryRouter>,
    )
    expect(screen.getByRole('heading', { level: 2, name: /주문진항 로스터리/ })).toBeInTheDocument()
    expect(screen.getByText('사진·장소 정보 출처: 한국관광공사')).toBeInTheDocument()
    expect(screen.getByRole('img', { name: '주문진항 로스터리' })).toBeInTheDocument() // image null → 아이콘 타일
    const siblings = screen.getByRole('list', { name: '같은 가지의 다른 장소' })
    expect(within(siblings).getAllByRole('button')).toHaveLength(3)
    await userEvent.click(within(siblings).getAllByRole('button')[0])
    expect(onOpenPlace).toHaveBeenCalledWith(expect.any(String), JUMUNJIN)
    await userEvent.click(screen.getByRole('button', { name: '주문진읍으로' }))
    await userEvent.click(screen.getByRole('button', { name: '소속 동 주문진읍 · 강릉시' }))
    expect(onBackToDong).toHaveBeenCalledTimes(2)
    expect(screen.getByRole('link', { name: '주문진읍 동네 프로필 보기 →' })).toHaveAttribute(
      'href',
      `/dongs/${JUMUNJIN}`,
    )
  })
  it('사진 로드 실패면 아이콘 타일', async () => {
    render(
      <MemoryRouter>
        <PlaceDetail
          index={index}
          place={{ ...place, image: 'https://example.com/x.jpg' }}
          onBackToDong={vi.fn()}
          onOpenPlace={vi.fn()}
        />
      </MemoryRouter>,
    )
    const img = screen.getByRole('img', { name: '주문진항 로스터리' })
    fireEvent.error(img)
    expect(await screen.findByRole('img', { name: '주문진항 로스터리' })).not.toHaveAttribute('src')
  })
})

describe('ExplorePanel', () => {
  it('접기 버튼으로 내용을 숨긴다', async () => {
    const onToggle = vi.fn()
    const { rerender } = render(
      <ExplorePanel collapsed={false} onToggleCollapsed={onToggle}>
        <p>내용</p>
      </ExplorePanel>,
    )
    await userEvent.click(screen.getByRole('button', { name: '패널 접기' }))
    expect(onToggle).toHaveBeenCalled()
    rerender(
      <ExplorePanel collapsed onToggleCollapsed={onToggle}>
        <p>내용</p>
      </ExplorePanel>,
    )
    expect(screen.queryByText('내용')).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: '패널 펼치기' })).toBeInTheDocument()
  })
})
