import type { MonthParam } from '@/features/metric/month'

export type SeasonType = 'summer_beach' | 'spring_autumn' | 'second_half_rise' | 'flat'
export type DongKind = 'living' | 'tourist'
export type LinkKind = 'support' | 'stay' | 'tour'

export type RegionPhoto = { url: string; credit?: string }
export type RegionLink = { kind: LinkKind; title: string; url: string }

/** GET /api/regions/{sggId}?month= */
export type RegionDetailResponse = {
  id: string
  name: string // 고성군
  province: string // 강원특별자치도
  tags: string[] // ['해안', '속초시 인접']
  seasonType: SeasonType // 계절 NMF 최대 비중 유형
  photos: RegionPhoto[]
  month: MonthParam
  stats: {
    crowdIndex: number // 해당 월 방문 ÷ 연중 최대 × 100 (annual: 평균)
    dayInflow: number // 평일 낮 체류 ÷ 새벽 체류 (소수 2자리)
    quietRank: number // dayInflow 오름차순 순위 (시군구 중)
    peerShare: number // 20~40대 방문 비율 % (정수)
    overnightCoef: number // 숙박 계수 (소수 2자리)
    weekendRatio: number // 주말 낮 체류 ÷ 주중 낮 체류 (소수 2자리)
  }
  months: { month: number; crowd: number }[] // 1~12, crowd 0~100
  bestMonths: number[] // crowd 최저 2개월, 오름차순
  avoidMonths: number[] // crowd 최고 2개월
  peerOffpeakMonths: number[] // peer_offpeak 최고 2개월
  dongs: RegionDong[]
  excludedDongs: { name: string; reason: 'special_facility' | 'masked' }[]
  links: RegionLink[]
}

export type RegionDong = {
  id: string // 행정동 코드 10자리
  name: string
  kind: DongKind
  landmark: string // '거진항', '송지호 해안' … 수동 관리
  quietScore: number // 전체 행정동 중 day_inflow 백분위, 0~100
  peakMonth: number // 동 자체 혼잡 최대 월
  crowdOfPeak: number // 선택 월 혼잡 ÷ 자체 최대 × 100 (annual: 100)
}

/** GET /api/regions/{sggId}/notes?sort=helpful&cursor= (W-04 dongs 도 같은 타입) */
export type NotesSort = 'helpful' | 'recent'
export type NotesResponse = { total: number; items: Note[]; nextCursor?: string }
export type Note = {
  id: string
  author: { nickname: string; initial: string }
  createdAt: string // ISO
  dongName?: string
  stayLabel?: string // '2주 체류'
  visitMonth?: MonthParam
  body: string
  helpful: number
  replies: number
}

/** GET /api/regions/{sggId}/poll?month=&preset= */
export type PollResponse = {
  question: string
  yes: number
  no: number
  total: number
  photos: { url: string; author: string }[]
}
