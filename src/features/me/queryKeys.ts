import type { MonthParam } from '@/features/metric/month'

export const meKeys = {
  all: ['me'] as const,
  summary: ['me', 'summary'] as const,
  favorites: (month: MonthParam) => ['me', 'favorites', { month }] as const,
  favoriteIds: ['me', 'favorites', 'ids'] as const,
  tips: ['me', 'tips'] as const,
  photos: ['me', 'photos'] as const,
  settings: ['me', 'settings'] as const,
}
