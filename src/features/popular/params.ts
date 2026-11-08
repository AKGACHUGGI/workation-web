import { POPULAR_SORTS, TERRAINS } from '@/features/popular/types'
import type { PopularSort, Terrain } from '@/features/popular/types'

export const DEFAULT_SORT: PopularSort = 'favorites'

export function parseSort(raw: string | null): PopularSort | null {
  if (raw === null) return null
  return (POPULAR_SORTS as readonly string[]).includes(raw) ? (raw as PopularSort) : null
}

function isTerrain(v: string): v is Terrain {
  return (TERRAINS as readonly string[]).includes(v)
}

export function normalizeTerrain(list: readonly Terrain[]): Terrain[] {
  return TERRAINS.filter((t) => list.includes(t))
}

/** 'city,coast,coast' → ['coast','city']. '' → []. 모르는 값 → null */
export function parseTerrain(raw: string | null): Terrain[] | null {
  if (raw === null) return null
  if (raw === '') return []
  const parts = raw.split(',').filter(Boolean)
  if (!parts.every(isTerrain)) return null
  return normalizeTerrain(parts)
}

export function serializeTerrain(list: readonly Terrain[]): string {
  return normalizeTerrain(list).join(',')
}
