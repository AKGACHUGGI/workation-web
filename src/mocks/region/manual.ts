import type { RegionLink, RegionPhoto, SeasonType } from '@/features/region/types'

export type SigunguManual = {
  id: string // 행정표준코드 5자리 (확정은 열린 항목)
  name: string
  province: string
  tags: string[]
  seasonType: SeasonType
  links: RegionLink[]
  photos: RegionPhoto[]
}

const photos = (id: string, n = 5): RegionPhoto[] =>
  Array.from({ length: n }, (_, i) => ({ url: `/mock-photos/${id}${i === 0 ? '' : `-${i}`}.jpg` }))

/** 12개 대상 시군구. tags·links 는 수동 관리(region_link) */
export const SIGUNGU_MANUAL: Record<string, SigunguManual> = {
  '51820': {
    id: '51820',
    name: '고성군',
    province: '강원특별자치도',
    tags: ['해안', '속초시 인접'],
    seasonType: 'second_half_rise',
    links: [
      { kind: 'support', title: '고성군 워케이션 체류 지원사업', url: 'https://www.gwgs.go.kr' },
      { kind: 'stay', title: '고성군 숙박 안내', url: 'https://www.gwgs.go.kr/tour' },
      { kind: 'tour', title: '화진포 · 송지호', url: 'https://www.gwgs.go.kr/tour' },
    ],
    photos: photos('51820'),
  },
  '51210': {
    id: '51210',
    name: '속초시',
    province: '강원특별자치도',
    tags: ['해안', '도시'],
    seasonType: 'summer_beach',
    links: [{ kind: 'tour', title: '속초 관광', url: 'https://www.sokcho.go.kr' }],
    photos: photos('51210'),
  },
  '51150': {
    id: '51150',
    name: '강릉시',
    province: '강원특별자치도',
    tags: ['해안', '도시'],
    seasonType: 'summer_beach',
    links: [{ kind: 'support', title: '강릉 워케이션', url: 'https://www.gn.go.kr' }],
    photos: photos('51150'),
  },
  '51170': {
    id: '51170',
    name: '동해시',
    province: '강원특별자치도',
    tags: ['해안'],
    seasonType: 'summer_beach',
    links: [{ kind: 'tour', title: '동해 관광', url: 'https://www.dh.go.kr' }],
    photos: photos('51170'),
  },
  '51830': {
    id: '51830',
    name: '양양군',
    province: '강원특별자치도',
    tags: ['해안', '서핑'],
    seasonType: 'summer_beach',
    links: [{ kind: 'tour', title: '양양 관광', url: 'https://www.yangyang.go.kr' }],
    photos: photos('51830'),
  },
  '52110': {
    id: '52110',
    name: '전주시',
    province: '전북특별자치도',
    tags: ['도시', '한옥마을'],
    seasonType: 'spring_autumn',
    links: [{ kind: 'support', title: '전주 한 달 살기', url: 'https://www.jeonju.go.kr' }],
    photos: photos('52110'),
  },
  '52140': {
    id: '52140',
    name: '정읍시',
    province: '전북특별자치도',
    tags: ['산간', '내장산'],
    seasonType: 'spring_autumn',
    links: [{ kind: 'tour', title: '정읍 관광', url: 'https://www.jeongeup.go.kr' }],
    photos: photos('52140'),
  },
  '52800': {
    id: '52800',
    name: '부안군',
    province: '전북특별자치도',
    tags: ['해안', '변산반도'],
    seasonType: 'summer_beach',
    links: [{ kind: 'tour', title: '부안 관광', url: 'https://www.buan.go.kr' }],
    photos: photos('52800'),
  },
  '46150': {
    id: '46150',
    name: '순천시',
    province: '전라남도',
    tags: ['도시', '순천만'],
    seasonType: 'spring_autumn',
    links: [{ kind: 'support', title: '순천 워케이션', url: 'https://www.suncheon.go.kr' }],
    photos: photos('46150'),
  },
  '46770': {
    id: '46770',
    name: '고흥군',
    province: '전라남도',
    tags: ['해안', '산간'],
    seasonType: 'flat',
    links: [{ kind: 'tour', title: '고흥 관광', url: 'https://www.goheung.go.kr' }],
    photos: photos('46770'),
  },
  '50110': {
    id: '50110',
    name: '제주시',
    province: '제주특별자치도',
    tags: ['해안', '도시'],
    seasonType: 'flat',
    links: [{ kind: 'support', title: '제주 워케이션', url: 'https://www.jeju.go.kr' }],
    photos: photos('50110'),
  },
  '50130': {
    id: '50130',
    name: '서귀포시',
    province: '제주특별자치도',
    tags: ['해안', '중문'],
    seasonType: 'flat',
    links: [{ kind: 'support', title: '서귀포 워케이션', url: 'https://www.seogwipo.go.kr' }],
    photos: photos('50130'),
  },
}

export const SIGUNGU_IDS = Object.keys(SIGUNGU_MANUAL)
