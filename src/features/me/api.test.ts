import { beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('@/lib/mock', () => ({ isMock: true, mockDelay: <T>(d: T) => Promise.resolve(d) }))

import {
  FavoriteLimitError,
  deleteFavorite,
  getFavoriteIds,
  getMyFavorites,
  putFavorite,
} from '@/features/me/api'
import { meStore, resetMeStore } from '@/mocks/me/store'

describe('me api (mock)', () => {
  beforeEach(() => resetMeStore())

  it('즐겨찾기 ids 는 regions 3 · dongs 3', async () => {
    const ids = await getFavoriteIds()
    expect(ids.regions).toEqual(['51820', '51150', '50130'])
    expect(ids.dongs).toHaveLength(3)
  })

  it('DELETE 후 목록·ids 에서 빠지고, PUT 하면 다시 들어간다 (멱등)', async () => {
    await deleteFavorite('regions', '51820')
    expect((await getFavoriteIds()).regions).not.toContain('51820')
    expect((await getMyFavorites('2025-10')).regions.map((r) => r.id)).not.toContain('51820')
    await putFavorite('regions', '51820')
    await putFavorite('regions', '51820')
    expect((await getFavoriteIds()).regions.filter((id) => id === '51820')).toHaveLength(1)
    // 되돌리기로 다시 넣으면 픽스처 항목(이름·사진)으로 복원
    const restored = (await getMyFavorites('2025-10')).regions.find((r) => r.id === '51820')
    expect(restored).toMatchObject({ name: '고성군', photoUrl: '/mock-photos/51820.jpg' })
  })

  it('모르는 id 를 PUT 하면 tier 정보 없이 최소 항목으로 추가된다', async () => {
    await putFavorite('dongs', '9999999999')
    expect((await getFavoriteIds()).dongs).toContain('9999999999')
  })

  it('50개를 넘기면 FavoriteLimitError', async () => {
    for (let i = 0; i < 47; i++) meStore.regions.push({ ...meStore.regions[0], id: `x${i}` })
    await expect(putFavorite('regions', 'overflow')).rejects.toBeInstanceOf(FavoriteLimitError)
  })
})
