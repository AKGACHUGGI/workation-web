import type { MetricScores } from '@/features/metric/types'
import type { MonthParam } from '@/features/metric/month'
import type { DongKind, Note } from '@/features/region/types'

export type MeSummary = {
  stays: { regionName: string; count: number }[]
  tipCount: number
  photoCount: number
  favoriteCount: number
  voteCount: number
  createdAt: string
}

export type FavoriteRegion = {
  id: string
  name: string
  province: string
  photoUrl: string
  scores: MetricScores // month 기준 (백엔드가 넣음)
  tags: string[] // Meta1
  note?: string
  visitMonth?: MonthParam
  addedAt: string
}

export type FavoriteDong = {
  id: string
  name: string
  kind: DongKind
  sigungu: { id: string; name: string }
  scores: MetricScores
  addedAt: string
}

export type FavoritesResponse = {
  month: MonthParam
  regions: FavoriteRegion[]
  dongs: FavoriteDong[]
}

export const FAVORITE_KINDS = ['regions', 'dongs'] as const
export type FavoriteKind = (typeof FAVORITE_KINDS)[number]

export type FavoriteIds = { regions: string[]; dongs: string[] }

export type MyTip = Note & { target: { kind: 'region' | 'dong'; id: string; name: string } }
export type MyTipsResponse = { items: MyTip[]; nextCursor?: string; helpfulSum: number }

export type MyPhoto = {
  id: string
  url: string
  month: MonthParam
  regionName: string
  status: 'approved' | 'pending'
}
export type MyPhotosResponse = { items: MyPhoto[] }

export type MeSettings = {
  notifyBestMonth: boolean
  notifyTipReaction: boolean
  notifyPhotoSelected: boolean
}

/** 즐겨찾기 상한 */
export const FAVORITE_LIMIT = 50
