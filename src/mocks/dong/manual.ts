import type { DongKind } from '@/features/region/types'

export type DongManual = {
  name: string
  sigungu: { id: string; name: string }
  province: string
  kind: DongKind
  tags: string[]
  landmarks: string[]
  accessNote: string
  bbox: [number, number, number, number]
  photoUrl: string
}

/** 수동 관리 항목 (스펙 §9). 사진은 소속 시군구 사진 */
export const DONG_MANUAL: Record<string, DongManual> = {
  '5182025300': {
    name: '거진읍',
    sigungu: { id: '51820', name: '고성군' },
    province: '강원특별자치도',
    kind: 'living',
    tags: ['해안'],
    landmarks: ['거진읍', '거진항', '화진포'],
    accessNote: '고성군 북부 · 속초 시외버스터미널에서 40분',
    bbox: [128.42, 38.41, 128.5, 38.49],
    photoUrl: '/mock-photos/51820.jpg',
  },
  '5182033000': {
    name: '죽왕면',
    sigungu: { id: '51820', name: '고성군' },
    province: '강원특별자치도',
    kind: 'tourist',
    tags: ['해안'],
    landmarks: ['송지호 해안', '왕곡마을', '공현진'],
    accessNote: '고성군 중부 · 속초에서 25분',
    bbox: [128.47, 38.3, 128.56, 38.4],
    photoUrl: '/mock-photos/51820.jpg',
  },
  '5182034000': {
    name: '토성면',
    sigungu: { id: '51820', name: '고성군' },
    province: '강원특별자치도',
    kind: 'living',
    tags: ['해안', '속초시 인접'],
    landmarks: ['아야진', '천진 해변', '봉포'],
    accessNote: '고성군 남부 · 속초 시외버스터미널에서 15분',
    bbox: [128.5, 38.22, 128.6, 38.31],
    photoUrl: '/mock-photos/51820.jpg',
  },
  '5121053500': {
    name: '금호동',
    sigungu: { id: '51210', name: '속초시' },
    province: '강원특별자치도',
    kind: 'living',
    tags: ['도심'],
    landmarks: ['속초 시외버스터미널', '중앙시장'],
    accessNote: '속초 도심 · 터미널 도보 10분',
    bbox: [128.58, 38.2, 128.6, 38.22],
    photoUrl: '/mock-photos/51210.jpg',
  },
  '5011062000': {
    name: '연동',
    sigungu: { id: '50110', name: '제주시' },
    province: '제주특별자치도',
    kind: 'tourist',
    tags: ['도심', '상권'],
    landmarks: ['누웨마루 거리', '제주 공항 10분'],
    accessNote: '제주시 신도심 · 공항에서 10분',
    bbox: [126.48, 33.47, 126.5, 33.5],
    photoUrl: '/mock-photos/50110.jpg',
  },
  '5013061000': {
    name: '중문동',
    sigungu: { id: '50130', name: '서귀포시' },
    province: '제주특별자치도',
    kind: 'tourist',
    tags: ['해안', '리조트'],
    landmarks: ['중문관광단지', '천제연폭포'],
    accessNote: '서귀포 서부 · 공항에서 50분',
    bbox: [126.4, 33.23, 126.45, 33.27],
    photoUrl: '/mock-photos/50130.jpg',
  },
  // 거진읍 유사 동네 3곳 — W-04 TwinCard·W-05 추천 탭이 상세를 조회한다
  '4677036000': {
    name: '봉래면',
    sigungu: { id: '46770', name: '고흥군' },
    province: '전라남도',
    kind: 'tourist',
    tags: ['해안', '섬'],
    landmarks: ['나로우주센터', '나로도항'],
    accessNote: '고흥군 남단 외나로도 · 고흥읍에서 차로 50분',
    bbox: [127.43, 34.4, 127.55, 34.5],
    photoUrl: '/mock-photos/46770.jpg',
  },
  '5117057000': {
    name: '삼화동',
    sigungu: { id: '51170', name: '동해시' },
    province: '강원특별자치도',
    kind: 'tourist',
    tags: ['산', '계곡'],
    landmarks: ['무릉계곡', '두타산'],
    accessNote: '동해시 서부 · 동해역에서 버스 30분',
    bbox: [128.98, 37.44, 129.08, 37.5],
    photoUrl: '/mock-photos/51170.jpg',
  },
  '5214036000': {
    name: '산내면',
    sigungu: { id: '52140', name: '정읍시' },
    province: '전북특별자치도',
    kind: 'living',
    tags: ['산', '호수'],
    landmarks: ['옥정호', '구절초 테마공원'],
    accessNote: '정읍시 남동부 · 정읍역에서 차로 40분',
    bbox: [127.02, 35.5, 127.15, 35.6],
    photoUrl: '/mock-photos/52140.jpg',
  },
}

/**
 * mock 상세가 있는 동 9곳. 1차 범위에서 이 밖의 동(W-03 행정동 목록의 나머지 58곳 등)은
 * getDongMock 이 undefined → fetchDong 이 NotFoundError → 404 페이지. 나머지는 gen-mock.py(2차)가 채운다.
 */
export const DONG_MOCK_IDS = Object.keys(DONG_MANUAL)
