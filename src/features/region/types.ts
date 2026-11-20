import type { MonthParam } from '@/features/metric/month'
import type { PresetKey } from '@/features/metric/types'

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
  /** 붙인 사진 (공개된 것만, 올린 순서). 예전 서버 응답엔 없을 수 있다 */
  photos?: NotePhoto[]
  /** 로그인 사용자가 쓴 팁이면 true (아니면 키가 없다) */
  mine?: true
  /** 로그인 사용자가 도움돼요를 눌렀으면 true */
  myHelpful?: true
}
export type NotePhoto = { id: string; url: string }

/** PATCH /api/me/tips/{id} {body} → 200 Note. 본문만 고친다 (사진·방문 월은 그대로) */
export type UpdateNoteRequest = { body: string }

/** PUT · DELETE /api/tips/{id}/helpful → 200. 내 팁엔 400 OWN_TIP */
export type HelpfulResponse = { helpful: number; myHelpful: boolean }

/** GET /api/tips/{id}/replies → {items} 오래된 순 · POST {body} → 201 Reply · DELETE /api/me/replies/{id} */
export type Reply = {
  id: string
  author: { nickname: string; initial: string }
  createdAt: string // ISO
  body: string
  mine?: true
}
export type RepliesResponse = { items: Reply[] }
export const REPLY_MAX_LEN = 300

/** GET /api/regions/{sggId}/poll?month=&preset= */
export type PollResponse = {
  question: string
  yes: number
  no: number
  total: number
  photos: { url: string; author: string }[]
  /** 로그인 사용자의 내 투표. 비로그인·미투표면 null (예전 서버 응답엔 없을 수 있다) */
  myVote?: PollChoice | null
}

/**
 * POST /api/{regions|dongs}/{id}/poll/vote → 200 PollResponse (로그인 필요).
 * choice null 은 투표 취소. 같은 (대상, month, preset) 에 사용자당 1표
 */
export type PollChoice = 'yes' | 'no'
export type PollTarget =
  | { kind: 'regions'; id: string; month: MonthParam; preset: PresetKey }
  | { kind: 'dongs'; id: string; month: MonthParam }
export type VotePollRequest = { month: MonthParam; preset?: PresetKey; choice: PollChoice | null }

/**
 * POST /api/{regions|dongs}/{id}/notes → 201 Note (로그인 필요).
 * body 는 앞뒤 공백을 자른 뒤 1~300자. 400 형식 오류 · 404 대상 없음 · 429 TIP_RATE_LIMIT(1분 3개)
 */
export const NOTE_MAX_LEN = 300
export type NoteTarget = { kind: 'regions' | 'dongs'; id: string }
export type CreateNoteRequest = {
  body: string
  visitMonth?: Exclude<MonthParam, 'annual'>
  /** 0~3장. 있으면 multipart 로 보낸다 (서버가 WebP 로 바꿔 R2 에 올린다) */
  photos?: File[]
}
export const NOTE_PHOTO_MAX = 3

/**
 * POST /api/{regions|dongs}/{id}/photos (multipart: month · photos 1~3장) → 201 {items: MyPhoto[]}.
 * 올리면 바로 공개되고, 신고가 쌓이면 가려진다
 */
export type MonthPhotoTarget = { kind: 'regions' | 'dongs'; id: string; month: MonthParam }
