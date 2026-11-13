import {
  BedDouble,
  BookOpen,
  Building2,
  Hotel,
  Laptop,
  Map as MapIcon,
  Mountain,
  Sailboat,
  Store,
  TreePalm,
  Trees,
  Waves,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

/** 관광공사 동 태그 묶음. 핀 아이콘 바탕색을 정한다 (Figma 변수 explore/group/*) */
export type TagGroup = 'trait' | 'work' | 'stay' | 'rest' | 'life'

/** 백엔드 PoiTag 순서 (food 제외). 핀 응답 tags 도 이 순서 */
export const TAG_ORDER = [
  'coast',
  'city',
  'cafe',
  'library',
  'long_stay',
  'resort',
  'beach',
  'park',
  'mountain',
  'island',
  'surf',
  'market',
] as const

export const TAG_GROUP: Record<string, TagGroup> = {
  coast: 'trait',
  city: 'trait',
  cafe: 'work',
  library: 'work',
  long_stay: 'stay',
  resort: 'stay',
  beach: 'rest',
  park: 'rest',
  mountain: 'rest',
  island: 'rest',
  surf: 'rest',
  market: 'life',
}

export const GROUP_COLOR: Record<TagGroup, string> = {
  trait: 'var(--color-explore-group-trait)',
  work: 'var(--color-explore-group-work)',
  stay: 'var(--color-explore-group-stay)',
  rest: 'var(--color-explore-group-rest)',
  life: 'var(--color-explore-group-life)',
}

export const TAG_ICON: Record<string, LucideIcon> = {
  coast: MapIcon,
  city: Building2,
  cafe: Laptop,
  library: BookOpen,
  long_stay: BedDouble,
  resort: Hotel,
  beach: Waves,
  park: Trees,
  mountain: Mountain,
  island: TreePalm,
  surf: Sailboat,
  market: Store,
}

/** 범례에 쓰는 짧은 이름 */
export const TAG_SHORT: Record<string, string> = {
  coast: '바닷가',
  city: '도심',
  cafe: '카페',
  library: '도서관',
  long_stay: '장기 숙소',
  resort: '리조트',
  beach: '해수욕장',
  park: '공원',
  mountain: '산·숲',
  island: '섬',
  surf: '서핑',
  market: '시장',
}

/** 핀에 그릴 태그: 아이콘이 있는 것 중 앞 2개 (스펙 §3-2) */
export function pinTags(tags: string[]): string[] {
  return tags.filter((t) => t in TAG_ICON).slice(0, 2)
}

/** ① 범례에 쓸 태그: 핀에 실제로 그려진 태그, TAG_ORDER 순 */
export function legendTags(pins: { tags: string[] }[]): string[] {
  const used = new Set(pins.flatMap((p) => pinTags(p.tags)))
  return TAG_ORDER.filter((t) => used.has(t))
}

export const EXPLORE_COPY = {
  pageTitle: '지도 탐색',
  collapsePanel: '패널 접기',
  expandPanel: '패널 펼치기',
  mapRegion: '탐색 지도',
  mapNoKey: '지도 키가 설정되지 않았습니다',
  loading: '불러오는 중',
  retry: '다시 시도',
  pinsError: '동네 목록을 불러오지 못했어요.',
  backToAll: '전체 지도로',
  sigunguTip: (name: string) => `${name} · 눌러서 확대`,
  sigunguTipSub: '행정동이 핀으로 보여요',
  legendHeat: '종합 점수 (홈과 같은 색)',
  legendClickToZoom: '누르면 확대',
  legendPin: '동네 핀 (아이콘 = 대표 태그)',
  legendSelected: '선택 중',
  legendDongBoundary: '행정동 경계',
  legendTagSource: '핀 아이콘: 한국관광공사 동 태그 기준',
} as const
