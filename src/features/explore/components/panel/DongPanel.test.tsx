import { beforeEach, describe, expect, it, vi } from 'vitest'
import { screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import renderWithRouter from '@/test/renderWithRouter'
import { GEUMAM, JUMUNJIN } from '@/test/fixtures/explore'

vi.mock('@/features/explore/api', () => ({ fetchDong: vi.fn(), fetchPins: vi.fn() }))

import { fetchDong } from '@/features/explore/api'
import DongPanel from '@/features/explore/components/panel/DongPanel'
import PanelSkeleton from '@/features/explore/components/panel/PanelSkeleton'
import { DONG_SECTION_H } from '@/features/explore/components/panel/panelLayout'
import { hourChipLabel } from '@/features/explore/labels'
import { NotFoundError } from '@/lib/errors'

const mocked = vi.mocked(fetchDong)
const props = () => ({ onBack: vi.fn(), onClose: vi.fn(), onOpenSimilar: vi.fn() })

// 중괄호 필수: beforeEach 가 함수를 돌려주면 vitest 가 테스트 뒤 정리 함수로 호출한다
beforeEach(() => {
  mocked.mockReset()
})

describe('DongPanel', () => {
  it('성공: 헤더 → 유형 → 그래프 → 상세 → 브리핑 → 비슷한 동 → 출처', async () => {
    mocked.mockResolvedValue(JUMUNJIN)
    const p = props()
    renderWithRouter(<DongPanel dongId={JUMUNJIN.id} {...p} />)
    expect(await screen.findByRole('heading', { level: 2, name: '주문진읍' })).toBeInTheDocument()
    const order = [...document.querySelectorAll('[data-section]')].map((el) =>
      el.getAttribute('data-section'),
    )
    expect(order).toEqual(['header', 'types', 'graph', 'detail', 'briefing'])
    expect(screen.getByRole('region', { name: '워케이션 유형' })).toBeInTheDocument()
    expect(screen.getByText(JUMUNJIN.briefing.join(' '))).toBeInTheDocument()
    expect(screen.getByRole('list', { name: '비슷한 바닷가 동' })).toBeInTheDocument()
    expect(screen.getByText('데이터: LG U+ 유동인구 2025 · 갱신 2026-11-13')).toBeInTheDocument()
    await userEvent.click(screen.getByRole('button', { name: '← 강릉시 그래프' }))
    expect(p.onBack).toHaveBeenCalledWith(JUMUNJIN.id)
    await userEvent.click(screen.getByRole('button', { name: /속초시 노학동/ }))
    expect(p.onOpenSimilar).toHaveBeenCalledWith(JUMUNJIN.similar[0])
  })

  it('토글 하나로 링·시간대 칩·24시간 막대가 함께 바뀐다', async () => {
    mocked.mockResolvedValue(JUMUNJIN)
    renderWithRouter(<DongPanel dongId={JUMUNJIN.id} {...props()} />)
    await screen.findByRole('heading', { level: 2, name: '주문진읍' })
    await userEvent.click(screen.getByRole('tab', { name: '주말' }))
    expect(
      screen.getByRole('button', { name: hourChipLabel(JUMUNJIN.hourly, 'weekend')! }),
    ).toBeInTheDocument()
    expect(screen.getByText('주말 시간대별 차량 이동')).toBeInTheDocument()
    expect(screen.getByText('주말 기준')).toBeInTheDocument()
  })

  it('한산한 달 칩 → 상세 칸만 바뀌고 높이 클래스는 같다', async () => {
    mocked.mockResolvedValue(JUMUNJIN)
    renderWithRouter(<DongPanel dongId={JUMUNJIN.id} {...props()} />)
    await screen.findByRole('heading', { level: 2, name: '주문진읍' })
    await userEvent.click(screen.getByRole('button', { name: /^한산한 달/ }))
    expect(screen.getByTestId('detail-slot')).toHaveClass(DONG_SECTION_H.detail)
    expect(within(screen.getByTestId('detail-slot')).getByText('강릉시 기준')).toBeInTheDocument()
  })

  it('브리핑 없음 → 준비 중, 비슷한 동 없음 → 칸 숨김', async () => {
    mocked.mockResolvedValue({ ...JUMUNJIN, briefing: [], similar: [] })
    renderWithRouter(<DongPanel dongId={JUMUNJIN.id} {...props()} />)
    expect(await screen.findByText('브리핑을 준비하고 있어요.')).toBeInTheDocument()
    expect(screen.queryByRole('heading', { name: '비슷한 바닷가 동' })).not.toBeInTheDocument()
  })

  it('내륙 동은 "비슷한 동"', async () => {
    mocked.mockResolvedValue(GEUMAM)
    renderWithRouter(<DongPanel dongId={GEUMAM.id} {...props()} />)
    expect(await screen.findByRole('heading', { name: '비슷한 동' })).toBeInTheDocument()
  })

  it('503 → "그래프를 불러오지 못했어요." + 다시 시도', async () => {
    // useDongQuery 가 404 가 아니면 한 번 더 시도하므로(1초 뒤) 두 번 모두 실패시킨다
    mocked.mockRejectedValue(new Error('API 503 Service Unavailable: /api/explore/dongs/x'))
    renderWithRouter(<DongPanel dongId={JUMUNJIN.id} {...props()} />)
    const alert = await screen.findByRole('alert', {}, { timeout: 3000 })
    expect(alert).toHaveTextContent('그래프를 불러오지 못했어요.')
    expect(mocked).toHaveBeenCalledTimes(2)
    mocked.mockResolvedValue(JUMUNJIN)
    await userEvent.click(within(alert).getByRole('button', { name: '다시 시도' }))
    expect(await screen.findByRole('heading', { level: 2, name: '주문진읍' })).toBeInTheDocument()
    expect(mocked).toHaveBeenCalledTimes(3)
  })

  it('404 → "동네 정보를 찾을 수 없어요." + 패널 닫기', async () => {
    mocked.mockRejectedValue(new NotFoundError('/api/explore/dongs/0000000000'))
    const p = props()
    renderWithRouter(<DongPanel dongId="0000000000" {...p} />)
    const alert = await screen.findByRole('alert')
    expect(alert).toHaveTextContent('동네 정보를 찾을 수 없어요.')
    expect(mocked).toHaveBeenCalledOnce()
    await userEvent.click(within(alert).getByRole('button', { name: '패널 닫기' }))
    expect(p.onClose).toHaveBeenCalledOnce()
  })

  it('0.2초 안에 오면 스켈레톤을 띄우지 않는다', async () => {
    mocked.mockResolvedValue(JUMUNJIN)
    renderWithRouter(<DongPanel dongId={JUMUNJIN.id} {...props()} />)
    expect(screen.queryByTestId('panel-skeleton')).not.toBeInTheDocument()
    await screen.findByRole('heading', { level: 2, name: '주문진읍' })
    expect(screen.queryByTestId('panel-skeleton')).not.toBeInTheDocument()
  })

  it('느리면 0.2초 뒤 스켈레톤(aria-busy + 숨김 문구)', async () => {
    mocked.mockReturnValue(new Promise(() => {}))
    renderWithRouter(<DongPanel dongId={JUMUNJIN.id} {...props()} />)
    const sk = await screen.findByTestId('panel-skeleton', {}, { timeout: 1000 })
    expect(sk).toHaveAttribute('aria-busy', 'true')
    expect(within(sk).getByText('불러오는 중')).toHaveClass('sr-only')
  })

  it('스켈레톤과 실제 패널의 섹션 높이가 같다', async () => {
    mocked.mockResolvedValue(JUMUNJIN)
    const { container } = renderWithRouter(
      <>
        <div data-testid="real">
          <DongPanel dongId={JUMUNJIN.id} {...props()} />
        </div>
        <div data-testid="sk">
          <PanelSkeleton />
        </div>
      </>,
    )
    await screen.findByRole('heading', { level: 2, name: '주문진읍' })
    for (const key of Object.keys(DONG_SECTION_H) as (keyof typeof DONG_SECTION_H)[]) {
      const real = container.querySelector(`[data-testid="real"] [data-section="${key}"]`)
      const sk = container.querySelector(`[data-testid="sk"] [data-section="${key}"]`)
      expect(real, key).toHaveClass(DONG_SECTION_H[key])
      expect(sk, key).toHaveClass(DONG_SECTION_H[key])
    }
  })
})
