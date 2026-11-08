import { describe, expect, it, vi } from 'vitest'
import { screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import renderWithRouter from '@/test/renderWithRouter'
import HeatmapRail from '@/features/heatmap/components/HeatmapRail'

vi.mock('@/features/tier/api', () => ({
  fetchTier: async (month: string, scope: string) => {
    const { getTierMock } = await import('@/mocks/tier')
    return getTierMock(month as never, scope as never)
  },
}))

describe('HeatmapRail (키 없음 → 플레이스홀더)', () => {
  it('시군구 12개를 점수와 함께 나열하고 양양군 54 가 보인다', async () => {
    renderWithRouter(<HeatmapRail hoverId={null} onHover={() => {}} />, {
      route: '/?month=2025-10',
    })
    expect(await screen.findByRole('link', { name: '양양군 54' })).toBeInTheDocument()
    expect(screen.getAllByRole('link')).toHaveLength(12)
  })

  it('지표 칩 클릭 → URL metric=quiet', async () => {
    renderWithRouter(<HeatmapRail hoverId={null} onHover={() => {}} />, {
      route: '/?month=2025-10',
    })
    await screen.findByRole('link', { name: '양양군 54' })
    await userEvent.click(screen.getByRole('button', { name: '동네 조용함' }))
    expect(screen.getByTestId('location')).toHaveTextContent('metric=quiet')
  })

  it('무효 metric 은 value 로 보정', async () => {
    renderWithRouter(<HeatmapRail hoverId={null} onHover={() => {}} />, { route: '/?metric=vibe' })
    expect(await screen.findByText('/?metric=value')).toBeInTheDocument()
  })

  it('행정동 모드는 시군구를 먼저 고르라는 안내', async () => {
    renderWithRouter(<HeatmapRail hoverId={null} onHover={() => {}} />, { route: '/?scope=dong' })
    expect(await screen.findByText(/시군구를 먼저/)).toBeInTheDocument()
  })

  it('행정동 모드 + sgg 없음: 시군구 칩 클릭 → sgg 설정 (이동하지 않음)', async () => {
    renderWithRouter(<HeatmapRail hoverId={null} onHover={() => {}} />, {
      route: '/?scope=dong&month=2025-10',
    })
    await userEvent.click(await screen.findByRole('button', { name: '양양군 54' }))
    expect(screen.getByTestId('location')).toHaveTextContent('sgg=51830')
    expect(screen.queryByText(/시군구를 먼저/)).not.toBeInTheDocument()
  })

  it('행정동 모드: 지도 위 시군구 선택 칩 12개, 고른 뒤에도 다른 시군구로 바꿀 수 있다', async () => {
    renderWithRouter(<HeatmapRail hoverId={null} onHover={() => {}} />, {
      route: '/?scope=dong&month=2025-10&sgg=51830',
    })
    const group = await screen.findByRole('group', { name: '시군구 선택' })
    const chips = await within(group).findAllByRole('button')
    expect(chips).toHaveLength(12)
    expect(within(group).getByRole('button', { name: '양양군' })).toHaveAttribute(
      'aria-pressed',
      'true',
    )
    await userEvent.click(within(group).getByRole('button', { name: '고성군' }))
    expect(screen.getByTestId('location')).toHaveTextContent('sgg=51820')
  })

  it('시군구 범위에서는 선택 칩이 없다', async () => {
    renderWithRouter(<HeatmapRail hoverId={null} onHover={() => {}} />, {
      route: '/?month=2025-10',
    })
    await screen.findByRole('link', { name: '양양군 54' })
    expect(screen.queryByRole('group', { name: '시군구 선택' })).not.toBeInTheDocument()
  })
})
