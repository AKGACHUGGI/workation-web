import type { FavoriteIds } from '@/features/me/types'
import { favoriteDongsMock, favoriteRegionsMock } from '@/mocks/me/favorites'

export const favoriteIdsMock: FavoriteIds = {
  regions: favoriteRegionsMock.map((r) => r.id),
  dongs: favoriteDongsMock.map((d) => d.id),
}
