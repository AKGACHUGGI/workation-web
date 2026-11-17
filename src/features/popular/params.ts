import { PLACE_TAGS, POPULAR_SORTS, TERRAINS } from '@/features/popular/types'
import type { PlaceTag, PopularSort, Terrain } from '@/features/popular/types'

export const DEFAULT_SORT: PopularSort = 'favorites'

export function parseSort(raw: string | null): PopularSort | null {
  if (raw === null) return null
  return (POPULAR_SORTS as readonly string[]).includes(raw) ? (raw as PopularSort) : null
}

/** 쉼표로 이은 목록 쿼리. 순서는 all 기준으로 정규화, 중복 제거 */
function listParam<T extends string>(all: readonly T[]) {
  const normalize = (list: readonly T[]): T[] => all.filter((t) => list.includes(t))
  /** 'city,coast,coast' → ['coast','city']. '' → []. 모르는 값 → null */
  const parse = (raw: string | null): T[] | null => {
    if (raw === null) return null
    if (raw === '') return []
    const parts = raw.split(',').filter(Boolean)
    if (!parts.every((v) => (all as readonly string[]).includes(v))) return null
    return normalize(parts as T[])
  }
  const serialize = (list: readonly T[]): string => normalize(list).join(',')
  return { normalize, parse, serialize }
}

const terrainParam = listParam<Terrain>(TERRAINS)
export const normalizeTerrain = terrainParam.normalize
export const parseTerrain = terrainParam.parse
export const serializeTerrain = terrainParam.serialize

const placeParam = listParam<PlaceTag>(PLACE_TAGS)
export const parsePlace = placeParam.parse
export const serializePlace = placeParam.serialize
