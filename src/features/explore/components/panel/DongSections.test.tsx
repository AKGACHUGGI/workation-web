import { describe, expect, it, vi } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import Briefing from '@/features/explore/components/panel/Briefing'
import PanelHeader from '@/features/explore/components/panel/PanelHeader'
import SourceLine from '@/features/explore/components/panel/SourceLine'
import TypeBars from '@/features/explore/components/panel/TypeBars'
import { GEUMAM, JUMUNJIN } from '@/test/fixtures/explore'

describe('PanelHeader', () => {
  it('← 시군구 그래프 · 이름 · 바닷가 칩 · 시도 · 시군구', async () => {
    const onBack = vi.fn()
    render(<PanelHeader dong={JUMUNJIN} onBack={onBack} />)
    expect(screen.getByRole('heading', { level: 2, name: '주문진읍' })).toBeInTheDocument()
    expect(screen.getByText('바닷가 0.0km')).toBeInTheDocument()
    expect(screen.getByText('강원특별자치도 · 강릉시')).toBeInTheDocument()
    await userEvent.click(screen.getByRole('button', { name: '강릉시 그래프로' }))
    expect(onBack).toHaveBeenCalledOnce()
  })
  it('내륙 동(coastKm null)은 바닷가 칩이 없다', () => {
    render(<PanelHeader dong={GEUMAM} onBack={() => {}} />)
    expect(screen.queryByText(/바닷가/)).not.toBeInTheDocument()
  })
})

describe('TypeBars', () => {
  it('점수 높은 순 4행, 1위 강조, 막대 폭 = 점수 %, 이유 한 줄', () => {
    render(<TypeBars types={JUMUNJIN.types} />)
    const region = screen.getByRole('region', { name: '워케이션 유형' })
    const rows = within(region).getAllByRole('listitem')
    expect(rows.map((r) => r.querySelector('[data-name]')?.textContent)).toEqual([
      '장기체류형',
      '로컬살이형',
      '네트워킹형',
      '몰입형',
    ])
    expect(rows[0]).toHaveAttribute('data-top', 'true')
    expect(rows[1]).not.toHaveAttribute('data-top')
    expect(rows[0].querySelector('[data-fill]')).toHaveStyle({ width: '61%' })
    expect(rows[0]).toHaveTextContent('숙박 성향 64 · 한산한 달 7개(성수기보다 20% 이상 적은 달)')
  })
})

describe('Briefing', () => {
  it('3문장을 한 문단으로, 칩·번호 없음', () => {
    render(<Briefing sentences={JUMUNJIN.briefing} />)
    expect(screen.getByRole('heading', { name: '이 동네에서 일하는 하루' })).toBeInTheDocument()
    expect(screen.getByText(JUMUNJIN.briefing.join(' '))).toBeInTheDocument()
    expect(screen.queryByText(/F\d/)).not.toBeInTheDocument()
  })
  it('빈 배열이면 준비 중 문구', () => {
    render(<Briefing sentences={[]} />)
    expect(screen.getByText('브리핑을 준비하고 있어요.')).toBeInTheDocument()
  })
})

describe('SourceLine', () => {
  it('문구를 그대로', () => {
    render(<SourceLine>데이터: LG U+ 유동인구 2025 · 갱신 2026-11-13</SourceLine>)
    expect(screen.getByText('데이터: LG U+ 유동인구 2025 · 갱신 2026-11-13')).toBeInTheDocument()
  })
})
