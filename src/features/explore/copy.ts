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
import type { DongGrades, ExploreDong, TagGroup } from '@/features/explore/types'
import type { Grade } from '@/features/metric/types'

export const MAX_TAGS = 3

/** 태그 바 표시 순서 (스펙 §6). 응답 tags 순서와 같다 */
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

export const GROUP_ORDER: TagGroup[] = ['trait', 'work', 'stay', 'rest', 'life']

/** 묶음 이름·색 (Figma 변수 explore/group/*) */
export const GROUP_META: Record<TagGroup, { label: string; color: string; bg: string }> = {
  trait: {
    label: '동네 성격',
    color: 'var(--color-explore-group-trait)',
    bg: 'var(--color-explore-group-trait-bg)',
  },
  work: {
    label: '일하기',
    color: 'var(--color-explore-group-work)',
    bg: 'var(--color-explore-group-work-bg)',
  },
  stay: {
    label: '머물기',
    color: 'var(--color-explore-group-stay)',
    bg: 'var(--color-explore-group-stay-bg)',
  },
  rest: {
    label: '쉬기',
    color: 'var(--color-explore-group-rest)',
    bg: 'var(--color-explore-group-rest-bg)',
  },
  life: {
    label: '생활',
    color: 'var(--color-explore-group-life)',
    bg: 'var(--color-explore-group-life-bg)',
  },
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

/** 지도 표시 툴팁·① 목록 숫자 앞에 쓰는 짧은 이름 (Figma: `카페 7 · 해수욕장 3`) */
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

/** 줌 ~8 도별 배지·화면 밖 칩 (`전북 8곳`) */
export const PROVINCE_SHORT: Record<string, string> = {
  '46': '전남',
  '50': '제주',
  '51': '강원',
  '52': '전북',
}

const GRADE_METRIC_LABEL: Record<keyof DongGrades, string> = {
  quiet: '동네 조용함',
  peer: '또래 밀도',
  evening: '저녁 활기',
}

export const EXPLORE_COPY = {
  pageTitle: '지도 탐색',
  tagBarLabel: '태그',
  tagScroll: '태그 더 보기',
  tagLimit: '태그는 3개까지 고를 수 있어요',
  matchModeLabel: '일치 방식',
  matchAny: (n: number) => `하나라도 있는 동 ${n}`,
  matchAll: (n: number) => `모두 있는 동 ${n}`,
  backToTags: (n: number) => `태그 지도로 돌아가기 · ${n}곳`,
  rangeTitle: '이 지도 범위 요약',
  pickHint: '위쪽 태그를 골라 보세요',
  pickHintSub: '태그를 고르면 그 태그가 있는 동네가 지도에 떠요. 아래 막대를 눌러도 골라져요.',
  barsCaption: '태그가 있는 동 수',
  barCount: (n: number) => `${n}곳`,
  selectedTitle: (n: number) => `선택한 태그 ${n}개`,
  selectedSub: (labels: string, n: number) => `${labels} · 하나라도 있는 동 ${n}곳`,
  allListTitle: '모두 있는 동 · 장소 많은 순',
  noAllMatch: '고른 태그를 모두 가진 동이 이 범위에 없어요',
  moreTags: '태그 더 고르기',
  emptyCombo: '이 조합의 동네가 없어요',
  showAny: '하나라도 있는 동 보기',
  markerHint: (name: string) => `누르면 ${name} 중심 그래프로 확대`,
  dongKind: '행정동',
  clearSelection: '선택 해제',
  gradeCaption: 'S 상위 25% · A · B · C 하위 25%',
  traitsTitle: '이 동네의 특징',
  traitsCaption: '고른 태그 = 지도 가지',
  traitPlaces: (n: number) => `장소 ${n}`,
  placeSection: (label: string, n: number) => `${label} · ${n}곳`,
  seeAll: '모두 보기',
  seeLess: '접기',
  noPlaces: (label: string) => `이 동네엔 ${label} 장소가 없어요`,
  similarTitle: '비슷한 동네',
  similarCaption: '다른 지역 · 누르면 그 동 중심으로',
  sharedTags: (labels: string) => `겹치는 태그 ${labels}`,
  profileCta: '동네 프로필 보기 →',
  profileCtaOf: (name: string) => `${name} 동네 프로필 보기 →`,
  backToDong: (name: string) => `${name}으로`,
  placeKind: '장소',
  belongsTo: (dong: string, sigungu: string) => `소속 동 ${dong} · ${sigungu}`,
  source: '사진·장소 정보 출처: 한국관광공사',
  siblingsTitle: '같은 가지의 다른 장소',
  dataLimit:
    '장소: 한국관광공사 등록 장소 기준 — 동네 카페·공유오피스·워케이션 센터는 빠져 있어요. 카페 많음은 관광 데이터에 잡힌 카페 기준이에요.',
  loading: '탐색 데이터를 불러오는 중이에요',
  loadError: '탐색 데이터를 불러오지 못했어요.',
  retry: '다시 시도',
  mapNoKey: '지도 키가 설정되지 않았습니다',
  mapRegion: '탐색 지도',
  excluded: '집계 제외',
  zoomStageLabel: '확대 단계',
  pathCaption: '지도 중심 기준 · 누르면 그 단계로 이동',
  coastBadge: (label: string, km: number) => `${label} · 해안 ${km}km`,
  more: (n: number) => `+${n}곳 더`,
  offscreen: (name: string, n: number) => `${name} ${n}곳`,
  provinceBadge: (short: string, n: number) => `${short} ${n}곳`,
  legendSelectedDong: '선택한 동 (바깥은 어둡게)',
  legendBranch: (label: string) => `${label} 가지`,
  legendAllBorder: '경계 = 모두 있음',
  collapsePanel: '패널 접기',
  expandPanel: '패널 펼치기',
} as const

/** null 지표를 뺀 등급 목록 (② 패널 등급 줄) */
export function gradeParts(
  grades: DongGrades | null,
): { metric: keyof DongGrades; label: string; grade: Grade }[] {
  if (!grades) return []
  return (Object.keys(GRADE_METRIC_LABEL) as (keyof DongGrades)[]).flatMap((metric) => {
    const grade = grades[metric]
    return grade ? [{ metric, label: GRADE_METRIC_LABEL[metric], grade }] : []
  })
}

/** `동네 조용함 S · 또래 밀도 A · 저녁 활기 B`. 등급이 하나도 없으면 null (줄 숨김) */
export function gradeLabel(grades: DongGrades | null): string | null {
  const parts = gradeParts(grades)
  if (parts.length === 0) return null
  return parts.map((p) => `${p.label} ${p.grade}`).join(' · ')
}

/** 비슷한 동네 행의 겹치는 태그 id (a 의 순서) */
export function sharedTags(a: ExploreDong, b: ExploreDong): string[] {
  const other = new Set(b.tags.map((t) => t.tagId))
  return a.tags.map((t) => t.tagId).filter((id) => other.has(id))
}
