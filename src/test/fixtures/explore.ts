import type { DongDetail, LifeTag, PinDong, TypeName } from '@/features/explore/types'
import type { Grade } from '@/features/metric/types'

type Row = [
  id: string,
  name: string,
  top: TypeName | null,
  score: number | null,
  coastal: boolean,
  life: LifeTag,
  quiet: Grade,
  evening: Grade,
]

/** 강릉 21동 실측 (2026-11-14 Supabase, 유형 3개 · 기준 40. 유형 없음은 null) */
const ROWS: Row[] = [
  ['5115061500', '강남동', '로컬살이형', 90, false, '생활권', 'S', 'B'],
  ['5115034000', '강동면', null, null, true, '관광지', 'C', 'B'], // 1위 32
  ['5115066500', '경포동', '네트워킹형', 74, true, '관광지', 'C', 'A'],
  ['5115055000', '교1동', '로컬살이형', 85, false, '생활권', 'A', 'A'],
  ['5115056000', '교2동', '로컬살이형', 64, false, '생활권', 'B', 'B'],
  ['5115033000', '구정면', '로컬살이형', 46, false, '관광지', 'B', 'B'],
  ['5115060000', '내곡동', '로컬살이형', 97, false, '생활권', 'S', 'B'],
  ['5115036000', '사천면', null, null, true, '관광지', 'C', 'B'], // 1위 37
  ['5115064500', '성덕동', '로컬살이형', 96, true, '생활권', 'S', 'B'],
  ['5115031000', '성산면', null, null, false, '관광지', 'B', 'C'], // 1위 38
  ['5115059000', '송정동', '몰입형', 63, true, '생활권', 'A', 'C'],
  ['5115037000', '연곡면', '몰입형', 50, true, '관광지', 'A', 'B'],
  ['5115035000', '옥계면', null, null, true, '관광지', 'B', 'B'], // 1위 34
  ['5115054000', '옥천동', '네트워킹형', 64, false, '관광지', 'C', 'B'],
  ['5115032000', '왕산면', null, null, false, '관광지', 'C', 'C'], // 1위 23
  ['5115025000', '주문진읍', '로컬살이형', 60, true, '생활권', 'B', 'A'],
  ['5115052000', '중앙동', '네트워킹형', 71, false, '관광지', 'C', 'A'],
  ['5115058000', '초당동', '네트워킹형', 64, true, '관광지', 'C', 'B'],
  ['5115057100', '포남1동', '로컬살이형', 89, false, '생활권', 'S', 'B'],
  ['5115057200', '포남2동', '로컬살이형', 87, true, '생활권', 'A', 'B'],
  ['5115051000', '홍제동', '로컬살이형', 88, false, '생활권', 'A', 'B'],
]

export const GANGNEUNG_PINS: PinDong[] = ROWS.map(
  ([id, name, topType, topScore, coastal, life, quiet, evening]) => ({
    id,
    name,
    center: null,
    tags: [],
    topType,
    topScore,
    coastal,
    life,
    grades: { quiet, evening },
  }),
)

export const JUMUNJIN_ID = '5115025000'
export const YEONGOK_ID = '5115037000'
export const WANGSAN_ID = '5115032000'

/** 주문진읍 실측 (graph_data/examples.md, 브리프 공통 §이미 확인한 사실) */
export const JUMUNJIN: DongDetail = {
  id: JUMUNJIN_ID,
  name: '주문진읍',
  sigungu: { id: '51150', name: '강릉시' },
  sido: '강원특별자치도',
  coastKm: 0,
  types: [
    { name: '로컬살이형', score: 60, reason: '생활권 지수 0.74' },
    { name: '네트워킹형', score: 50, reason: '또래 밀도 39 · 저녁 활기 62' },
    { name: '몰입형', score: 36, reason: '조용함 31 · 오전 한산 44' },
  ],
  grades: {
    quiet: { grade: 'B', score: 31 },
    peer: { grade: 'B', score: 39 },
    evening: { grade: 'A', score: 62 },
  },
  hourly: {
    weekday: {
      driv: [
        637, 511, 478, 471, 497, 601, 782, 1129, 1576, 1573, 1712, 1969, 2064, 2042, 2036, 2024,
        1969, 1920, 1666, 1321, 1091, 941, 793, 680,
      ],
      peakHour: 12,
      quietHour: 9,
    },
    weekend: {
      driv: [
        790, 638, 593, 569, 580, 669, 828, 1078, 1408, 1769, 2203, 2623, 2808, 2824, 2833, 2766,
        2548, 2353, 2010, 1659, 1369, 1122, 912, 788,
      ],
      peakHour: 14,
      quietHour: 3,
    },
  },
  months: {
    raw: [80.3, 69.8, 78.4, 70.0, 81.9, 78.0, 89.4, 100.0, 70.5, 85.9, 72.5, 74.9],
    quiet: [2, 4, 9],
    basis: '강릉시',
  },
  briefing: [
    '평일 차량은 12시에 2,064명으로 가장 많고, 업무시간엔 9시가 가장 한산해요.',
    '강릉시는 2·4·9월이 가장 한산하고 8월이 가장 붐벼요.',
    '로컬살이형이 60점으로 가장 잘 맞고, 저녁 활기는 강릉시 21개 동 중 1위(A, 62점)예요.',
  ],
  similar: [
    {
      id: '5121057000',
      name: '노학동',
      sigungu: '속초시',
      common: 6,
      commonTop: ['조용함 B', '1위 로컬살이형', '바닷가'],
      diff: { quiet: 8, peer: 13, evening: -15 },
    },
    {
      id: '5013025000',
      name: '대정읍',
      sigungu: '서귀포시',
      common: 4,
      commonTop: ['저녁 활기 A', '바닷가', '주말 3시 한산'],
      diff: { quiet: 19, peer: 11, evening: -3 },
    },
    {
      id: '5013056000',
      name: '영천동',
      sigungu: '서귀포시',
      common: 5,
      commonTop: ['조용함 B', '저녁 활기 A', '바닷가'],
      diff: { quiet: 10, peer: 20, evening: 5 },
    },
  ],
  syncedAt: '2026-11-13T10:00:00+09:00',
}

/** 금암동(전주시, 내륙). '비슷한 동' 제목·바닷가 칩 없음 확인용 */
export const GEUMAM: DongDetail = {
  ...JUMUNJIN,
  id: '5211357500',
  name: '금암동',
  // 시군구 id 는 경계 파일·mock 과 같은 전주시 52110 (계획서 52113 은 덕진구 코드라 맞춤)
  sigungu: { id: '52110', name: '전주시' },
  sido: '전북특별자치도',
  coastKm: null,
  similar: [
    {
      id: '5211151000',
      name: '중앙동',
      sigungu: '전주시',
      common: 5,
      commonTop: ['같은 전주시', '1위 네트워킹형', '조용함 C'],
      diff: { quiet: -7, peer: 1, evening: 3 },
    },
  ],
}
