import type { PopularSort, Terrain } from '@/features/popular/types'

export const SORT_LABEL: Record<PopularSort, string> = {
  favorites: '즐겨찾기 많은 순',
  views: '조회 많은 순',
  score: '종합 점수순',
}

/** 배지 접두어 ('즐겨찾기 1위') */
export const SORT_BADGE_PREFIX: Record<PopularSort, string> = {
  favorites: '즐겨찾기',
  views: '조회',
  score: '종합',
}

export const TERRAIN_LABEL: Record<Terrain, string> = {
  coast: '해안',
  mountain: '산간',
  city: '도시',
}

export const POPULAR_NOTE =
  '카드는 즐겨찾기 수 · 조회수 · 종합 점수 중 선택한 기준으로 정렬됩니다. 종합 점수는 선택한 프리셋 가중치의 가중 평균(0~100), 등급은 같은 달 12곳 안에서 백분위 사분위. 수동면 등 특수시설 패턴 행정동은 제외.'

export const EMPTY_NOTE = '조건에 맞는 지역이 없어요'
export const POPULAR_ERROR = '인기 지역을 불러오지 못했습니다'
