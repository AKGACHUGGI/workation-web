import { hashString } from '@/features/explore/hash'
import { TYPE_NAMES } from '@/features/explore/types'
import type {
  DayGroup,
  DongDetail,
  GradeValue,
  HourlyDay,
  PinDong,
  SimilarDong,
} from '@/features/explore/types'
import { GRADES } from '@/features/metric/types'
import type { Grade } from '@/features/metric/types'
import { DONG_BASE, SIGUNGU_BASE } from '@/mocks/explore/base.generated'
import { allPins } from '@/mocks/explore/pins'

const SYNCED_AT = '2026-11-13T10:00:00+09:00'
const SIDO: Record<string, string> = {
  '46': '전라남도',
  '50': '제주특별자치도',
  '51': '강원특별자치도',
  '52': '전북특별자치도',
}

const JUMUNJIN_WEEKDAY = [
  637, 511, 478, 471, 497, 601, 782, 1129, 1576, 1573, 1712, 1969, 2064, 2042, 2036, 2024, 1969,
  1920, 1666, 1321, 1091, 941, 793, 680,
]
const JUMUNJIN_WEEKEND = [
  790, 638, 593, 569, 580, 669, 828, 1078, 1408, 1769, 2203, 2623, 2808, 2824, 2833, 2766, 2548,
  2353, 2010, 1659, 1369, 1122, 912, 788,
]

/** 시군구 ease 원값 1~12월 실측 (graph_data F3). 없는 시군구는 seedMonths */
const MONTH_RAW: Record<string, number[]> = {
  '51150': [80.3, 69.8, 78.4, 70, 81.9, 78, 89.4, 100, 70.5, 85.9, 72.5, 74.9],
  '52110': [79.6, 74.8, 94.4, 84.3, 86.9, 82.1, 83, 79.1, 93.1, 100, 87.8, 86],
}

/** 주문진읍 (graph_data/examples.md, 2026-11-13 실측) */
export const JUMUNJIN_DETAIL: DongDetail = {
  id: '5115025000',
  name: '주문진읍',
  sigungu: { id: '51150', name: '강릉시' },
  sido: '강원특별자치도',
  coastKm: 0,
  types: [
    {
      name: '장기체류형',
      score: 61,
      reason: '숙박 성향 64 · 한산한 달 7개(성수기보다 20% 이상 적은 달)',
    },
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
    weekday: { driv: JUMUNJIN_WEEKDAY, peakHour: 12, quietHour: 9 },
    weekend: { driv: JUMUNJIN_WEEKEND, peakHour: 14, quietHour: 3 },
  },
  months: { raw: MONTH_RAW['51150'], quiet: [2, 4, 9], basis: '강릉시' },
  briefing: [
    '평일 차량은 12시에 가장 많고, 업무시간엔 9시가 가장 한산해요.',
    '강릉시는 2·4·9월이 가장 한산하고 8월이 가장 붐벼요.',
    '장기체류형 61점으로, 저녁 활기 A(62점)이에요. 저녁 활기는 강릉시 21동 중 1위예요.',
  ],
  similar: [
    {
      id: '5121057000',
      name: '노학동',
      sigungu: '속초시',
      common: 6,
      commonTop: ['조용함 B', '1위 장기체류형', '바닷가'],
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
  syncedAt: SYNCED_AT,
}

/** 전주시 금암동 (graph_data/examples.md·facts.json). 몰입형 '오전 한산 14' 는 facts.json 오전 블록 백분위로 계산 */
export const GEUMAM_DETAIL: DongDetail = {
  id: '5211357500',
  name: '금암동',
  sigungu: { id: '52110', name: '전주시' },
  sido: '전북특별자치도',
  coastKm: null,
  types: [
    { name: '네트워킹형', score: 96, reason: '또래 밀도 97 · 저녁 활기 94' },
    { name: '로컬살이형', score: 53, reason: '생활권 지수 0.72' },
    {
      name: '장기체류형',
      score: 26,
      reason: '숙박 성향 27 · 한산한 달 3개(성수기보다 20% 이상 적은 달)',
    },
    { name: '몰입형', score: 18, reason: '조용함 21 · 오전 한산 14' },
  ],
  grades: {
    quiet: { grade: 'C', score: 21 },
    peer: { grade: 'S', score: 97 },
    evening: { grade: 'S', score: 94 },
  },
  hourly: {
    weekday: {
      driv: [
        2101, 1767, 1435, 1182, 1114, 1205, 2194, 2933, 4323, 4172, 4152, 4167, 4153, 4377, 4293,
        4302, 4406, 4478, 4451, 3482, 3111, 2932, 2663, 2289,
      ],
      peakHour: 17,
      quietHour: 10,
    },
    weekend: {
      driv: [
        2291, 1939, 1677, 1371, 1211, 1186, 2003, 2189, 2699, 3123, 3493, 3606, 3879, 3964, 3949,
        3935, 3899, 3890, 3710, 3396, 3206, 2965, 2645, 2338,
      ],
      peakHour: 13,
      quietHour: 5,
    },
  },
  months: { raw: MONTH_RAW['52110'], quiet: [1, 2, 8], basis: '전주시' },
  briefing: [
    '평일 차량은 17시에 가장 많고, 업무시간엔 10시가 가장 한산해요.',
    '전주시는 1·2·8월이 가장 한산하고 10월이 가장 붐벼요.',
    '네트워킹형 96점으로, 또래 밀도 S(97점)이에요. 업무시간 차량 변화가 전국에서 가장 작은 편이에요.',
  ],
  similar: [
    {
      id: '5211151000',
      name: '중앙동',
      sigungu: '전주시',
      common: 5,
      commonTop: ['같은 전주시', '1위 네트워킹형', '조용함 C'],
      diff: { quiet: -7, peer: 1, evening: 3 },
    },
    {
      id: '5211160500',
      name: '노송동',
      sigungu: '전주시',
      common: 5,
      commonTop: ['같은 전주시', '1위 네트워킹형', '조용함 C'],
      diff: { quiet: -15, peer: -5, evening: 1 },
    },
    {
      id: '5211153000',
      name: '풍남동',
      sigungu: '전주시',
      common: 5,
      commonTop: ['같은 전주시', '1위 네트워킹형', '조용함 C'],
      diff: { quiet: -20, peer: -1, evening: 5 },
    },
  ],
  syncedAt: SYNCED_AT,
}

const REAL: Record<string, DongDetail> = {
  [JUMUNJIN_DETAIL.id]: JUMUNJIN_DETAIL,
  [GEUMAM_DETAIL.id]: GEUMAM_DETAIL,
}

const MOCK_REASON = '시안용 예시 값 — 백엔드 응답으로 교체'
const GRADE_BASE: Record<Grade, number> = { S: 85, A: 60, B: 35, C: 10 }
const GRADE_NAME = { quiet: '조용함', peer: '또래 밀도', evening: '저녁 활기' } as const

const range = (from: number, to: number) => Array.from({ length: to - from }, (_, i) => from + i)

/** 스펙 §6-2: 평일 quiet = 9~17시 중 최소, 주말 = 하루 중 최소, peak = 하루 중 최대. 같으면 이른 시각 */
function hourStats(driv: number[], day: DayGroup): HourlyDay {
  const quietRange = day === 'weekday' ? range(9, 18) : range(0, 24)
  return {
    driv,
    peakHour: range(0, 24).reduce((a, b) => (driv[b] > driv[a] ? b : a)),
    quietHour: quietRange.reduce((a, b) => (driv[b] < driv[a] ? b : a)),
  }
}

/** 원값 낮은 3개월, 같은 값이면 이른 달, 달 순 */
function quietMonths(raw: number[]): number[] {
  return raw
    .map((v, i) => ({ v, m: i + 1 }))
    .sort((a, b) => a.v - b.v || a.m - b.m)
    .slice(0, 3)
    .map((x) => x.m)
    .sort((a, b) => a - b)
}

function seedMonths(sigunguId: string): number[] {
  const raw = range(1, 13).map((m) => 70 + (hashString(`${sigunguId}:${m}`) % 31))
  const max = Math.max(...raw)
  return raw.map((v) => Math.round((v / max) * 1000) / 10)
}

/** 받침 있으면 '은', 없으면 '는' */
function topicOf(word: string): string {
  const code = word.charCodeAt(word.length - 1) - 0xac00
  return code >= 0 && code % 28 !== 0 ? `${word}은` : `${word}는`
}

function gradeValue(grade: Grade, seed: number): GradeValue {
  return { grade, score: GRADE_BASE[grade] + (seed % 15) }
}

function gradesOf(pin: PinDong): DongDetail['grades'] {
  const h = hashString(pin.id)
  return {
    quiet: pin.grades.quiet && gradeValue(pin.grades.quiet, h),
    peer: gradeValue(GRADES[(h >>> 4) % 4], h >>> 8),
    evening: pin.grades.evening && gradeValue(pin.grades.evening, h >>> 12),
  }
}

/** 두 핀의 공통 사실 문구 (백엔드 §6-3 문구 형식) */
function sharedLabels(a: PinDong, b: PinDong, sameSigungu: string | null): string[] {
  const facts = (p: PinDong) =>
    [
      p.grades.quiet && `조용함 ${p.grades.quiet}`,
      p.grades.evening && `저녁 활기 ${p.grades.evening}`,
      p.topType && `1위 ${p.topType}`,
      p.coastal && '바닷가',
      p.life,
    ].filter((x): x is string => Boolean(x))
  const other = new Set(facts(b))
  const common = facts(a).filter((f) => other.has(f))
  return sameSigungu ? [`같은 ${sameSigungu}`, ...common] : common
}

function similarOf(pin: PinDong, sigunguId: string): SimilarDong[] {
  const pins = allPins()
  const mine = gradesOf(pin)
  const sggName = (id: string) => SIGUNGU_BASE.find((s) => s.id === id)?.name ?? ''
  return DONG_BASE.filter((d) => d.id !== pin.id && pins.get(d.id)?.coastal === pin.coastal)
    .sort((a, b) => hashString(pin.id + a.id) - hashString(pin.id + b.id))
    .slice(0, 3)
    .map((d) => {
      const other = pins.get(d.id)!
      const theirs = gradesOf(other)
      const labels = sharedLabels(pin, other, d.sigunguId === sigunguId ? sggName(sigunguId) : null)
      const diff = (k: 'quiet' | 'peer' | 'evening') => {
        const a = mine[k]
        const b = theirs[k]
        return a && b ? b.score - a.score : null
      }
      return {
        id: d.id,
        name: d.name,
        sigungu: sggName(d.sigunguId),
        common: labels.length,
        commonTop: labels.slice(0, 3),
        diff: { quiet: diff('quiet'), peer: diff('peer'), evening: diff('evening') },
      }
    })
}

/** 실측이 없는 동: 핀 값과 id 해시로 만든 시안용 상세 */
function seedDong(dongId: string): DongDetail | null {
  const base = DONG_BASE.find((d) => d.id === dongId)
  const pin = allPins().get(dongId)
  const sgg = SIGUNGU_BASE.find((s) => s.id === base?.sigunguId)
  if (!base || !pin || !sgg) return null
  const h = hashString(dongId)
  const top = pin.topType ?? TYPE_NAMES[0]
  const topScore = pin.topScore ?? 50
  const types = [
    { name: top, score: topScore, reason: MOCK_REASON },
    ...TYPE_NAMES.filter((t) => t !== top).map((name, i) => ({
      name,
      score: Math.max(5, topScore - 5 - i * 10 - ((h >>> (i * 3)) % 5)),
      reason: MOCK_REASON,
    })),
  ]
  const k = 0.4 + (h % 120) / 100
  const weekday = hourStats(
    JUMUNJIN_WEEKDAY.map((v) => Math.round(v * k)),
    'weekday',
  )
  const weekend = hourStats(
    JUMUNJIN_WEEKEND.map((v) => Math.round(v * k)),
    'weekend',
  )
  const raw = MONTH_RAW[sgg.id] ?? seedMonths(sgg.id)
  const quiet = quietMonths(raw)
  const busiest = raw.indexOf(Math.max(...raw)) + 1
  const grades = gradesOf(pin)
  const best = (['quiet', 'peer', 'evening'] as const)
    .flatMap((key) => {
      const g = grades[key]
      return g ? [{ key, ...g }] : []
    })
    .sort((a, b) => b.score - a.score)[0]
  return {
    id: dongId,
    name: base.name,
    sigungu: { id: sgg.id, name: sgg.name },
    sido: SIDO[sgg.provinceId] ?? '',
    coastKm: pin.coastal ? (h % 10) / 10 : null,
    types,
    grades,
    hourly: { weekday, weekend },
    months: { raw, quiet, basis: sgg.name },
    briefing: [
      `평일 차량은 ${weekday.peakHour}시에 가장 많고, 업무시간엔 ${weekday.quietHour}시가 가장 한산해요.`,
      `${topicOf(sgg.name)} ${quiet.join('·')}월이 가장 한산하고 ${busiest}월이 가장 붐벼요.`,
      best
        ? `${top} ${topScore}점으로, ${GRADE_NAME[best.key]} ${best.grade}(${best.score}점)이에요.`
        : `${top} ${topScore}점이에요.`,
    ],
    similar: similarOf(pin, sgg.id),
    syncedAt: SYNCED_AT,
  }
}

/** GET /api/explore/dongs/{id} mock. 주문진읍·금암동은 실측, 그 밖은 결정적 생성. 없는 동은 null */
export function dongMock(dongId: string): DongDetail | null {
  return REAL[dongId] ?? seedDong(dongId)
}
