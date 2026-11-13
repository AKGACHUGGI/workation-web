import type { AskResponse, DongDetail } from '@/features/explore/types'
import { dongMock, topicOf } from '@/mocks/explore/dong'
import { allPins } from '@/mocks/explore/pins'

/** 답할 수 있는 의도 10개와 대표 질문 (백엔드 스펙 §3-1 순서) */
const CANONICAL = {
  weekday_hours: '평일엔 몇 시가 붐비고 몇 시가 한산해?',
  weekend_hours: '주말엔 몇 시가 붐비고 몇 시가 한산해?',
  months: '1년 중 언제 가면 한산해?',
  quiet: '이 동네 조용해?',
  peer: '또래 사람들이 많아?',
  evening: '저녁에 활기 있어?',
  type: '어떤 워케이션에 잘 맞아?',
  coast: '바다가 가까워?',
  life: '생활권이야, 관광지야?',
  similar: '비슷한 동네는 어디야?',
} as const
type Intent = keyof typeof CANONICAL
const INTENTS = Object.keys(CANONICAL) as Intent[]

/** mock 전용 의도 찾기: 앞에서부터 처음 맞는 낱말. 백엔드는 임베딩 최근접(§4-1) */
const KEYWORDS: [Intent, RegExp][] = [
  ['weekend_hours', /주말/],
  ['weekday_hours', /평일|몇 ?시|시간|오전|아침|점심/],
  ['months', /언제|\d+ ?월|몇 ?월|계절|성수기/],
  ['quiet', /조용|한적/],
  ['peer', /또래|사람/],
  ['evening', /저녁|밤|활기/],
  ['type', /유형|워케이션|맞아/],
  ['coast', /바다|해안/],
  ['life', /생활권|관광지/],
  ['similar', /비슷/],
]

/** 답할 수 없는 질문 안내 (백엔드 스펙 §3-2). mock 은 식당·카페 질문과 그 밖 두 가지만 */
const GUIDE_PLACE = {
  pattern: /밥|맛집|카페|식당/,
  answer:
    '이 지도는 동네의 붐빔과 분위기를 보고 있어서 식당·카페는 아직 몰라요. 대신 점심·저녁에 이 동네가 얼마나 북적이는지는 알려 드릴 수 있어요.',
  examples: [CANONICAL.weekday_hours, CANONICAL.evening, CANONICAL.quiet],
}
const GUIDE_OTHER = {
  answer:
    '이 지도는 동네의 붐빔과 분위기를 보고 있어서 그 질문엔 아직 답하기 어려워요. 이런 건 알려 드릴 수 있어요.',
  examples: [CANONICAL.quiet, CANONICAL.months, CANONICAL.similar],
}
const NO_DATA = '이 동네는 그 내용을 계산할 데이터가 부족해요.'
const GRADE_NAME = { quiet: '조용함', peer: '또래 밀도', evening: '저녁 활기' } as const

/** 백엔드 규칙 문장(§4-4)을 동 상세 값으로 만든다. 전국 순위는 동 상세에 없어 뺀다 */
function ruleSentence(intent: Intent, d: DongDetail): string {
  switch (intent) {
    case 'weekday_hours':
    case 'weekend_hours': {
      const day = intent === 'weekday_hours' ? 'weekday' : 'weekend'
      const { peakHour, quietHour } = d.hourly[day]
      if (peakHour === null || quietHour === null) return NO_DATA
      return day === 'weekday'
        ? `평일 차량은 ${peakHour}시에 가장 많고, 업무시간엔 ${quietHour}시가 가장 한산해요.`
        : `주말 차량은 ${peakHour}시에 가장 많고, ${quietHour}시가 가장 한산해요.`
    }
    case 'months': {
      const values = d.months.raw.map((v) => v ?? -Infinity)
      const busiest = values.indexOf(Math.max(...values)) + 1
      return `${topicOf(d.months.basis)} ${d.months.quiet.join('·')}월이 가장 한산하고 ${busiest}월이 가장 붐벼요.`
    }
    case 'quiet':
    case 'peer':
    case 'evening': {
      const g = d.grades[intent]
      return g ? `${topicOf(GRADE_NAME[intent])} ${g.grade}등급(${g.score}점)이에요.` : NO_DATA
    }
    case 'type': {
      const [a, b] = d.types
      return `${a.name} ${a.score}점으로 가장 잘 맞고, 다음은 ${b.name} ${b.score}점이에요.`
    }
    case 'coast':
      return d.coastKm !== null && d.coastKm <= 1
        ? `해안선까지 ${d.coastKm.toFixed(1)}km인 바닷가 동네예요.`
        : '해안선에서 1km 넘게 떨어진 동네예요.'
    case 'life': {
      const life = allPins().get(d.id)?.life
      return life ? `${life} 성격이 강한 동네예요.` : NO_DATA
    }
    case 'similar':
      return d.similar.length > 0
        ? `지표가 비슷한 동네는 ${d.similar.map((s) => `${s.sigungu} ${s.name}`).join(', ')}이에요.`
        : NO_DATA
  }
}

/**
 * POST /api/explore/dongs/{id}/ask mock. 식당·카페 → guide, 낱말이 맞는 의도 → 규칙 문장(rule),
 * 맞는 의도가 없으면 그 밖 안내(guide). 동 값은 dongMock (주문진읍·금암동 실측, 그 밖 결정적 생성). 없는 동은 null
 */
export function askMock(dongId: string, question: string): AskResponse | null {
  const dong = dongMock(dongId)
  if (!dong) return null
  const q = question.trim()
  const intent = GUIDE_PLACE.pattern.test(q) ? null : KEYWORDS.find(([, re]) => re.test(q))?.[0]
  if (!intent) {
    const guide = intent === null ? GUIDE_PLACE : GUIDE_OTHER
    return {
      question: q,
      answer: [guide.answer],
      intents: [],
      source: 'guide',
      examples: guide.examples,
    }
  }
  return {
    question: q,
    answer: [ruleSentence(intent, dong)],
    intents: [intent],
    source: 'rule',
    examples: INTENTS.filter((i) => i !== intent)
      .slice(0, 3)
      .map((i) => CANONICAL[i]),
  }
}
