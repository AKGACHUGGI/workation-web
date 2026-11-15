import { describe, expect, it, vi } from 'vitest'
import { screen, within } from '@testing-library/react'
import renderWithRouter from '@/test/renderWithRouter'
import type { BoostUnit } from '@/features/interest'
import type { FavoriteRegion } from '@/features/me/types'
import { favoriteRegionsMock } from '@/mocks/me/favorites'

const boostSpy = vi.fn<(u: BoostUnit) => number>(() => 0)

vi.mock('@/features/me/useRemoveFavoriteWithUndo', () => ({
  useRemoveFavoriteWithUndo: () => vi.fn(),
}))
vi.mock('@/features/interest', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@/features/interest')>()),
  useBoost: () => boostSpy,
}))
// 같은 달 시군구 티어 응답: 고성군만 지형이 있다
vi.mock('@/features/tier/useTierQuery', () => ({
  useTierQuery: () => ({ data: { items: [{ id: '51820', terrain: ['coast', 'mountain'] }] } }),
}))

import FavoriteRegions from '@/features/me/components/FavoriteRegions'

// 조용한 곳 가중치(3·3·1·1·0)로 종합 50.375 가 되게 overnight 만 바꾼다
const goseong: FavoriteRegion = {
  ...favoriteRegionsMock[0],
  scores: { ...favoriteRegionsMock[0].scores, overnight: 79 },
}

function render(regions: FavoriteRegion[]) {
  renderWithRouter(
    <FavoriteRegions regions={regions} month="2025-10" preset="quiet" metrics={null} />,
    { route: '/me?month=2025-10' },
  )
}

const card = (name: RegExp) => screen.getByRole('link', { name })

describe('FavoriteRegions 관심 가산점', () => {
  it('passes terrain from the sigungu tier item to boost, like the tier table', () => {
    boostSpy.mockClear()
    render([goseong, favoriteRegionsMock[1]])
    expect(boostSpy).toHaveBeenCalledWith(
      expect.objectContaining({ id: '51820', terrain: ['coast', 'mountain'] }),
    )
    // 티어 응답에 없는 지역은 지형 없이
    expect(boostSpy).toHaveBeenCalledWith(
      expect.objectContaining({ id: '51150', terrain: undefined }),
    )
    expect(boostSpy.mock.calls.every(([u]) => u.sigunguId === undefined)).toBe(true)
  })

  it('rounds only once after adding boost to the unrounded composite', () => {
    // 50.375 + 0.3 = 50.675 → 51 (예전 방식 round(50.375) + 0.3 → 50 과 다르다)
    boostSpy.mockImplementation((u) => (u.id === '51820' ? 0.3 : 0))
    render([goseong, favoriteRegionsMock[1]])
    expect(within(card(/고성군/)).getByText('51')).toBeInTheDocument()
    boostSpy.mockImplementation(() => 0)
  })

  it('shows the rounded base score without records', () => {
    boostSpy.mockImplementation(() => 0)
    render([goseong, favoriteRegionsMock[1]])
    expect(within(card(/고성군/)).getByText('50')).toBeInTheDocument()
    expect(within(card(/강릉시/)).getByText('29')).toBeInTheDocument()
  })
})
