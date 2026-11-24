import { describe, expect, it } from 'vitest'
import type { ChatRequest } from '@/features/chat/types'
import { chatMock } from '@/mocks/explore/chat'

const JUMUNJIN = '5115025000'
const GEUMAM = '5211357500'

const body = (question: string, panel = JUMUNJIN): ChatRequest => ({
  conversationId: null,
  surface: 'dong',
  panel,
  month: null,
  question,
  criteria: { chips: [], interest: { metric: {}, terrain: {}, recent: [] } },
})

describe('chatMock', () => {
  it('동 1개: 의도별 규칙 문장, conversationId = mock-<동>', () => {
    expect(chatMock(body('이 동네 조용해?'))).toEqual({
      conversationId: `mock-${JUMUNJIN}`,
      scope: 'dong',
      dongs: [{ id: JUMUNJIN, name: '주문진읍' }],
      intent: 'quiet',
      sentences: [{ text: '조용함은 B등급(31점)이에요.', source: 'rule' }],
      guide: null,
      examples: [
        '평일엔 몇 시가 붐비고 몇 시가 한산해?',
        '주말엔 몇 시가 붐비고 몇 시가 한산해?',
        '1년 중 언제 가면 한산해?',
      ],
    })
    expect(chatMock(body('평일엔 몇 시가 붐비고 몇 시가 한산해?'))!.sentences[0].text).toBe(
      '평일 차량은 12시에 가장 많고, 업무시간엔 9시가 가장 한산해요.',
    )
  })

  it('같은 시군구 동 이름 → 비교 답 2문장 + 동 2개', () => {
    const res = chatMock(body('경포동이랑 비교하면?'))!
    expect(res.dongs).toEqual([
      { id: JUMUNJIN, name: '주문진읍' },
      { id: '5115066500', name: '경포동' },
    ])
    expect(res.intent).toBe('compare_summary')
    expect(res.guide).toBeNull()
    expect(res.sentences).toEqual([
      { text: '조용함은 주문진읍 B등급, 경포동 C등급이에요.', source: 'rule' },
      { text: '저녁 활기는 주문진읍 A등급, 경포동 A등급이에요.', source: 'rule' },
    ])
    expect(res.examples).toEqual(['둘이 비슷해?', '주말엔 몇 시가 붐벼?', '언제 가면 한산해?'])
  })

  it('다른 시군구 동 이름 → 같은 시군구 안내(guide)만', () => {
    const res = chatMock(body('효자2동이랑 비교해 줘'))!
    expect(res.sentences).toEqual([])
    expect(res.dongs).toEqual([{ id: JUMUNJIN, name: '주문진읍' }])
    expect(res.guide).toMatch(
      /^지금은 같은 시군구 안의 동네끼리만 비교할 수 있어요\. 강릉시에서는 .+, .+, .+ 등과 비교해 볼 수 있어요\.$/,
    )
  })

  it('밥·맛집·카페 → unknown_place 안내', () => {
    for (const q of ['밥먹기 좋아?', '맛집 있어?', '카페 많아?']) {
      const res = chatMock(body(q))!
      expect(res.intent).toBe('unknown_place')
      expect(res.sentences).toEqual([])
      expect(res.guide).toMatch(/^이 지도는 동네의 붐빔과 분위기를 보고 있어서 식당·카페는/)
      expect(res.examples).toEqual([
        '평일엔 몇 시가 붐비고 몇 시가 한산해?',
        '저녁에 활기 있어?',
        '이 동네 조용해?',
      ])
    }
  })

  it('맞는 의도가 없으면 unknown_other 안내', () => {
    const res = chatMock(body('날씨 어때?'))!
    expect(res.intent).toBe('unknown_other')
    expect(res.guide).toMatch(/그 질문엔 아직 답하기 어려워요/)
  })

  it('금암동(내륙) 바다 질문, 없는 동은 null', () => {
    expect(chatMock(body('바다가 가까워?', GEUMAM))!.sentences[0].text).toBe(
      '해안선에서 1km 넘게 떨어진 동네예요.',
    )
    expect(chatMock(body('이 동네 조용해?', '0000000000'))).toBeNull()
  })
})

describe('chatMock 시군구', () => {
  it('조용함 등급 순 동 3곳, scope region, 없는 시군구는 null', () => {
    const res = chatMock({
      conversationId: null,
      surface: 'region',
      sigungu: '51820',
      month: '2025-10',
      question: '조용한 동네 어디야?',
      criteria: { chips: [], interest: { metric: {}, terrain: {}, recent: [] } },
    })
    expect(res?.scope).toBe('region')
    expect(res?.conversationId).toBe('mock-51820')
    expect(res?.dongs.length).toBeGreaterThan(0)
    expect(res?.dongs.length).toBeLessThanOrEqual(3)
    expect(res?.sentences[0].text).toMatch(/^조용한 순으로 /)
    expect(
      chatMock({
        conversationId: null,
        surface: 'region',
        sigungu: '99999',
        month: null,
        question: '조용한 동네 어디야?',
        criteria: { chips: [], interest: { metric: {}, terrain: {}, recent: [] } },
      }),
    ).toBeNull()
  })
  it('질문에 이 시군구 동 이름이 있으면 그 동의 동 답(비교), 대화 id 는 시군구 것', () => {
    const res = chatMock({
      conversationId: null,
      surface: 'region',
      sigungu: '51820',
      month: '2025-10',
      question: '거진읍이랑 토성면 비교해 줘',
      criteria: { chips: [], interest: { metric: {}, terrain: {}, recent: [] } },
    })
    expect(res).toMatchObject({
      conversationId: 'mock-51820',
      scope: 'dong',
      intent: 'compare_summary',
      dongs: [
        { id: '5182025300', name: '거진읍' },
        { id: '5182033000', name: '토성면' },
      ],
      sentences: [
        { text: '조용함은 거진읍 B등급, 토성면 C등급이에요.', source: 'rule' },
        { text: '저녁 활기는 거진읍 C등급, 토성면 A등급이에요.', source: 'rule' },
      ],
    })
  })
})
