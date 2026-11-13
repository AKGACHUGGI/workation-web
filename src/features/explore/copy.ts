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
  // ── 패널 (파트 B) ──
  loadingSr: '불러오는 중',
  guideTitle: '지역을 골라 보세요',
  guideBody:
    '지도에서 시군구를 눌러 보세요. 누르면 그 시군구의 동네들이 유형별로 이어진 그래프가 열려요.',
  sigunguSub: (province: string, n: number) => `${province} · 행정동 ${n}곳`,
  relationChipsLabel: '관계',
  graphLabel: (name: string) => `${name} 지식그래프`,
  factNode: (label: string) => `사실 ${label}`,
  cardCommon: (n: number) => `공통 ${n}`,
  cardFactTitle: (label: string, n: number) => `${label} · 이어진 동 ${n}곳`,
  openDong: '동네 자세히 보기',
  legendDong: '동 (원 크기 = 1위 유형 점수)',
  legendType: '유형',
  legendCoast: '바닷가',
  legendLife: '생활권/관광지',
  legendGrade: '등급',
  sigunguSource:
    '데이터: LG U+ 유동인구 2025 · 생활권 = 생활권 지수 0.7 이상 · 바닷가 = 해안선 1km 이내',
  backToGraph: (sigungu: string) => `← ${sigungu} 그래프`,
  dongSub: (sido: string, sigungu: string) => `${sido} · ${sigungu}`,
  coastChip: (km: number) => `바닷가 ${km.toFixed(1)}km`,
  typesTitle: '워케이션 유형',
  dayToggleLabel: '평일·주말',
  dayLabel: { weekday: '평일', weekend: '주말' },
  factGraphLabel: '동네 근거 그래프',
  detailLabel: '상세',
  hourUnit: (h: number) => `${h}시`,
  monthUnit: (m: number) => `${m}월`,
  hourBarsTitle: '시간대별 차량 이동',
  monthBarsTitle: '월별 방문 지수',
  monthBasis: (basis: string) => `${basis} 기준`,
  noValue: '값 없음',
  briefingTitle: '이 동네에서 일하는 하루',
  briefingEmpty: '브리핑을 준비하고 있어요.',
  similarCoastTitle: '비슷한 바닷가 동',
  similarPlainTitle: '비슷한 동',
  similarHint: '지표 거리 기준 · 점수 차 = 상대 − 이 동',
  dongSource: (date: string) => `데이터: LG U+ 유동인구 2025 · 갱신 ${date}`,
  dongError: '그래프를 불러오지 못했어요.',
  dongNotFound: '동네 정보를 찾을 수 없어요.',
  closePanel: '패널 닫기',
} as const
