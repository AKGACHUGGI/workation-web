import type { FavoriteDong, FavoriteRegion, MeSettings, MyPhoto, MyTip } from '@/features/me/types'
import { favoriteDongsMock, favoriteRegionsMock } from '@/mocks/me/favorites'
import { myPhotosMock } from '@/mocks/me/photos'
import { meSettingsMock } from '@/mocks/me/settings'
import { myTipsMock } from '@/mocks/me/tips'

/** mock 모드에서 PUT/DELETE/PATCH 결과를 기억하는 메모리 저장소 */
export const meStore: {
  regions: FavoriteRegion[]
  dongs: FavoriteDong[]
  tips: MyTip[]
  photos: MyPhoto[]
  settings: MeSettings
} = {
  regions: [...favoriteRegionsMock],
  dongs: [...favoriteDongsMock],
  tips: [...myTipsMock],
  photos: [...myPhotosMock],
  settings: { ...meSettingsMock },
}

/** 테스트용 초기화 */
export function resetMeStore() {
  meStore.regions = [...favoriteRegionsMock]
  meStore.dongs = [...favoriteDongsMock]
  meStore.tips = [...myTipsMock]
  meStore.photos = [...myPhotosMock]
  meStore.settings = { ...meSettingsMock }
}
