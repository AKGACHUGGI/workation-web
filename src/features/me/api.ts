import { api } from '@/lib/api'
import { isMock, mockDelay } from '@/lib/mock'
import type { MonthParam } from '@/features/metric/month'
import {
  FAVORITE_LIMIT,
  type FavoriteDong,
  type FavoriteIds,
  type FavoriteKind,
  type FavoriteRegion,
  type FavoritesResponse,
  type MeSettings,
  type MeSummary,
  type MyPhotosResponse,
  type MyTipsResponse,
} from '@/features/me/types'
import { favoriteDongsMock, favoriteRegionsMock } from '@/mocks/me/favorites'
import { meSummaryMock } from '@/mocks/me/summary'
import { meStore } from '@/mocks/me/store'

/** PUT /api/me/favorites 409 */
export class FavoriteLimitError extends Error {
  constructor() {
    super('favorite limit exceeded')
    this.name = 'FavoriteLimitError'
  }
}

export function getMeSummary(): Promise<MeSummary> {
  if (isMock) {
    return mockDelay({
      ...meSummaryMock,
      favoriteCount: meStore.regions.length + meStore.dongs.length,
      tipCount: meStore.tips.length,
      photoCount: meStore.photos.length,
    })
  }
  return api<MeSummary>('/api/me/summary')
}

export function getMyFavorites(month: MonthParam): Promise<FavoritesResponse> {
  if (isMock) return mockDelay({ month, regions: [...meStore.regions], dongs: [...meStore.dongs] })
  return api<FavoritesResponse>(`/api/me/favorites?month=${month}`)
}

export function getFavoriteIds(): Promise<FavoriteIds> {
  if (isMock) {
    return mockDelay(
      { regions: meStore.regions.map((r) => r.id), dongs: meStore.dongs.map((d) => d.id) },
      50,
    )
  }
  return api<FavoriteIds>('/api/me/favorites/ids')
}

const EMPTY_SCORES = { quiet: 0, crowd: 0, peer: 0, overnight: 0, vibe: 0 }

export async function putFavorite(kind: FavoriteKind, id: string): Promise<void> {
  if (isMock) {
    const list = meStore[kind] as { id: string }[]
    if (list.some((x) => x.id === id)) return mockDelay(undefined, 50)
    if (list.length >= FAVORITE_LIMIT) throw new FavoriteLimitError()
    const addedAt = new Date().toISOString()
    // 픽스처에 있는 id(해제 후 되돌리기)는 원래 항목으로 복원한다
    const knownRegion = favoriteRegionsMock.find((r) => r.id === id)
    const knownDong = favoriteDongsMock.find((d) => d.id === id)
    if (kind === 'regions' && knownRegion) {
      meStore.regions.push({ ...knownRegion, addedAt })
    } else if (kind === 'dongs' && knownDong) {
      meStore.dongs.push({ ...knownDong, addedAt })
    } else if (kind === 'regions') {
      meStore.regions.push({
        id,
        name: id,
        province: '',
        photoUrl: '',
        scores: EMPTY_SCORES,
        tags: [],
        addedAt,
      } satisfies FavoriteRegion)
    } else {
      meStore.dongs.push({
        id,
        name: id,
        kind: 'living',
        sigungu: { id: '', name: '' },
        scores: EMPTY_SCORES,
        addedAt,
      } satisfies FavoriteDong)
    }
    return mockDelay(undefined, 50)
  }
  try {
    await api<void>(`/api/me/favorites/${kind}/${id}`, { method: 'PUT' })
  } catch (e) {
    if (e instanceof Error && e.message.startsWith('API 409')) throw new FavoriteLimitError()
    throw e
  }
}

export function deleteFavorite(kind: FavoriteKind, id: string): Promise<void> {
  if (isMock) {
    if (kind === 'regions') meStore.regions = meStore.regions.filter((r) => r.id !== id)
    else meStore.dongs = meStore.dongs.filter((d) => d.id !== id)
    return mockDelay(undefined, 50)
  }
  return api<void>(`/api/me/favorites/${kind}/${id}`, { method: 'DELETE' })
}

export function getMyTips(cursor?: string): Promise<MyTipsResponse> {
  if (isMock) {
    return mockDelay({
      items: [...meStore.tips],
      helpfulSum: meStore.tips.reduce((s, t) => s + t.helpful, 0),
    })
  }
  const qs = cursor ? `?cursor=${encodeURIComponent(cursor)}` : ''
  return api<MyTipsResponse>(`/api/me/tips${qs}`)
}

export function deleteMyTip(id: string): Promise<void> {
  if (isMock) {
    meStore.tips = meStore.tips.filter((t) => t.id !== id)
    return mockDelay(undefined, 50)
  }
  return api<void>(`/api/me/tips/${id}`, { method: 'DELETE' })
}

export function getMyPhotos(): Promise<MyPhotosResponse> {
  if (isMock) return mockDelay({ items: [...meStore.photos] })
  return api<MyPhotosResponse>('/api/me/photos')
}

export function getMeSettings(): Promise<MeSettings> {
  if (isMock) return mockDelay({ ...meStore.settings })
  return api<MeSettings>('/api/me/settings')
}

export function patchMeSettings(patch: Partial<MeSettings>): Promise<MeSettings> {
  if (isMock) {
    meStore.settings = { ...meStore.settings, ...patch }
    return mockDelay({ ...meStore.settings }, 50)
  }
  return api<MeSettings>('/api/me/settings', { method: 'PATCH', body: JSON.stringify(patch) })
}
