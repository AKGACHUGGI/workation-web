import { describe, expect, it, vi } from 'vitest'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import renderWithRouter from '@/test/renderWithRouter'
import { favoriteDongsMock } from '@/mocks/me/favorites'

vi.mock('@/features/me/useRemoveFavoriteWithUndo', () => ({
  useRemoveFavoriteWithUndo: () => vi.fn(),
}))

import FavoriteDongs from '@/features/me/components/FavoriteDongs'

describe('FavoriteDongs 비교 선택 모드', () => {
  it('1개 선택이면 비교하기 비활성, 2개면 /compare?dongs= 링크, 4개째는 선택 불가', async () => {
    const four = [
      ...favoriteDongsMock,
      { ...favoriteDongsMock[0], id: '9999999999', name: '네번째' },
    ]
    renderWithRouter(<FavoriteDongs dongs={four} />, { route: '/me?month=2025-10' })
    await userEvent.click(screen.getByRole('button', { name: '선택해서 비교' }))
    await userEvent.click(screen.getByRole('checkbox', { name: '거진읍' }))
    expect(screen.getByRole('button', { name: '비교하기' })).toBeDisabled()
    await userEvent.click(screen.getByRole('checkbox', { name: '죽왕면' }))
    expect(screen.getByRole('link', { name: '비교하기' })).toHaveAttribute(
      'href',
      '/compare?dongs=5182025300%2C5182033000&month=2025-10',
    )
    await userEvent.click(screen.getByRole('checkbox', { name: '중문동' }))
    expect(screen.getByRole('checkbox', { name: '네번째' })).toBeDisabled()
  })
})
