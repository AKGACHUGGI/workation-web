import { describe, expect, it, vi } from 'vitest'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import renderWithRouter from '@/test/renderWithRouter'
import CompareColumn from '@/features/compare/components/CompareColumn'
import type { DongDetailResponse } from '@/features/dong/types'
import type { TierItem } from '@/features/tier/types'

const detail: DongDetailResponse = {
  id: '5182025300',
  name: '거진읍',
  sigungu: { id: '51820', name: '고성군' },
  province: '강원특별자치도',
  kind: 'living',
  tags: ['해안'],
  photos: [],
  landmarks: ['거진항'],
  accessNote: '',
  month: '2025-10',
  stats: { dayInflow: 0.79, localLife: 75, peerShare: 39, eveningVibe: 0.18, eveningSurplus: 0.85 },
  hourly: { weekday: Array(24).fill(50), weekend: Array(24).fill(60) },
  peaks: {
    weekday: { peakHour: 11, lowHour: 3, lowValue: 48 },
    weekend: { peakHour: 13, lowHour: 4, lowValue: 40 },
  },
  activityMix: { weekendTourist: 32, eveningDowntown: 25, weekdayWork: 24, dawnResidential: 19 },
  seasonType: 'second_half_rise',
  quieterTwins: [],
  bbox: [128.4, 38.3, 128.6, 38.5],
}

const tierItem: TierItem = {
  id: '5182025300',
  name: '거진읍',
  province: '강원특별자치도',
  sigungu: { id: '51820', name: '고성군' },
  photoUrl: '',
  scores: { quiet: 37, crowd: 40, peer: 44, overnight: 76, vibe: 38 }, // W-02 dong-2025-10 픽스처
  inherited: ['overnight'],
  terrain: ['coast'],
}

describe('CompareColumn', () => {
  it('이름 링크(쿼리 유지)·지표 4종·부제·요약을 보여준다', () => {
    renderWithRouter(
      <CompareColumn
        id="5182025300"
        detail={detail}
        tierItem={tierItem}
        rank={{ rank: 3, total: 5 }}
        tierPending={false}
        isPending={false}
        isError={false}
        onRetry={() => {}}
        onRemove={() => {}}
      />,
      { route: '/compare?dongs=5182025300&month=2025-10' },
    )
    expect(screen.getByRole('link', { name: '거진읍' })).toHaveAttribute(
      'href',
      '/dongs/5182025300?month=2025-10',
    )
    expect(screen.getByText('강원특별자치도 고성군')).toBeInTheDocument()
    expect(screen.getByText('37')).toBeInTheDocument() // 동네 조용함
    expect(screen.getByText('38')).toBeInTheDocument() // 저녁 활기
    expect(screen.getByText('44')).toBeInTheDocument() // 또래 밀도
    expect(screen.getByText('75')).toBeInTheDocument() // 생활권 지수
    expect(screen.getByText('고성군 내 3위 · 낮 유입 0.79')).toBeInTheDocument()
    expect(screen.getByText(/주말에 사람이 몰리고/)).toBeInTheDocument()
  })

  it('× 버튼은 onRemove', async () => {
    const onRemove = vi.fn()
    renderWithRouter(
      <CompareColumn
        id="5182025300"
        detail={detail}
        tierItem={tierItem}
        rank={null}
        tierPending={false}
        isPending={false}
        isError={false}
        onRetry={() => {}}
        onRemove={onRemove}
      />,
    )
    await userEvent.click(screen.getByRole('button', { name: '거진읍 제거' }))
    expect(onRemove).toHaveBeenCalledTimes(1)
  })

  it('에러면 다시 시도', async () => {
    const onRetry = vi.fn()
    renderWithRouter(
      <CompareColumn
        id="x"
        tierPending={false}
        isPending={false}
        isError
        rank={null}
        onRetry={onRetry}
        onRemove={() => {}}
      />,
    )
    expect(screen.getByText('불러오지 못했습니다')).toBeInTheDocument()
    await userEvent.click(screen.getByRole('button', { name: '다시 시도' }))
    expect(onRetry).toHaveBeenCalledTimes(1)
  })

  it('로딩이면 스켈레톤', () => {
    renderWithRouter(
      <CompareColumn
        id="x"
        tierPending={false}
        isPending
        isError={false}
        rank={null}
        onRetry={() => {}}
        onRemove={() => {}}
      />,
    )
    expect(screen.getByTestId('column-skeleton')).toBeInTheDocument()
  })

  it('티어 응답 대기 중이면 상세가 있어도 스켈레톤 (0·C 깜빡임 없음)', () => {
    renderWithRouter(
      <CompareColumn
        id="5182025300"
        detail={detail}
        tierPending
        rank={null}
        isPending={false}
        isError={false}
        onRetry={() => {}}
        onRemove={() => {}}
      />,
    )
    expect(screen.getByTestId('column-skeleton')).toBeInTheDocument()
    expect(screen.queryByText('0')).not.toBeInTheDocument()
  })

  it('티어 항목이 끝내 없으면 티어 지표 3개는 —, 생활권 지수는 표시', () => {
    renderWithRouter(
      <CompareColumn
        id="5182025300"
        detail={detail}
        tierPending={false}
        rank={null}
        isPending={false}
        isError={false}
        onRetry={() => {}}
        onRemove={() => {}}
      />,
    )
    expect(screen.getAllByText('—')).toHaveLength(3)
    expect(screen.getByText('75')).toBeInTheDocument()
  })
})
