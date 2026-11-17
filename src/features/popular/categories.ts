import type { LucideIcon } from 'lucide-react'
import {
  BedDouble,
  Building,
  Coffee,
  ConciergeBell,
  Library,
  Mountain,
  Sailboat,
  Store,
  TreePalm,
  Trees,
  Umbrella,
  UtensilsCrossed,
  Waves,
} from 'lucide-react'
import type { PlaceTag, Terrain } from '@/features/popular/types'

export type CategoryFilter =
  { kind: 'terrain'; value: Terrain } | { kind: 'place'; value: PlaceTag }

export type Category = { key: string; label: string; icon: LucideIcon; filter: CategoryFilter }

const terrain = (value: Terrain, label: string, icon: LucideIcon): Category => ({
  key: value,
  label,
  icon,
  filter: { kind: 'terrain', value },
})
const place = (value: PlaceTag, label: string, icon: LucideIcon): Category => ({
  key: value,
  label,
  icon,
  filter: { kind: 'place', value },
})

/** 홈 카테고리 = 장소 태그 필터만 (백엔드 webapi/data.py TAG_KO 순서·라벨). 분위기(프리셋)는 MoodRow */
export const CATEGORIES: Category[] = [
  terrain('coast', '해안', Waves),
  terrain('mountain', '산간', Mountain),
  terrain('city', '도시', Building),
  place('beach', '해수욕장', Umbrella),
  place('island', '섬', TreePalm),
  place('surf', '서핑', Sailboat),
  place('cafe', '카페 많음', Coffee),
  place('food', '음식점 많음', UtensilsCrossed),
  place('library', '도서관', Library),
  place('park', '공원', Trees),
  place('market', '시장', Store),
  place('resort', '리조트', ConciergeBell),
  place('long_stay', '장기 숙소', BedDouble),
]
