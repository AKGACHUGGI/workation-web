import { describe, expect, it } from 'vitest'
import { askMock } from '@/mocks/explore/ask'

const JUMUNJIN = '5115025000'
const GEUMAM = '5211357500'

describe('askMock', () => {
  it('주문진읍 실측 값으로 의도별 규칙 문장', () => {
    const ask = (q: string) => askMock(JUMUNJIN, q)!.answer[0]
    expect(ask('평일엔 몇 시가 붐비고 몇 시가 한산해?')).toBe(
      '평일 차량은 12시에 가장 많고, 업무시간엔 9시가 가장 한산해요.',
    )
    expect(ask('주말엔 몇 시가 붐비고 몇 시가 한산해?')).toBe(
      '주말 차량은 14시에 가장 많고, 3시가 가장 한산해요.',
    )
    expect(ask('1년 중 언제 가면 한산해?')).toBe(
      '강릉시는 2·4·9월이 가장 한산하고 8월이 가장 붐벼요.',
    )
    expect(ask('이 동네 조용해?')).toBe('조용함은 B등급(31점)이에요.')
    expect(ask('또래 사람들이 많아?')).toBe('또래 밀도는 B등급(39점)이에요.')
    expect(ask('저녁에 활기 있어?')).toBe('저녁 활기는 A등급(62점)이에요.')
    expect(ask('어떤 워케이션에 잘 맞아?')).toBe(
      '장기체류형 61점으로 가장 잘 맞고, 다음은 로컬살이형 60점이에요.',
    )
    expect(ask('바다가 가까워?')).toBe('해안선까지 0.0km인 바닷가 동네예요.')
    expect(ask('생활권이야, 관광지야?')).toBe('생활권 성격이 강한 동네예요.')
    expect(ask('비슷한 동네는 어디야?')).toBe(
      '지표가 비슷한 동네는 속초시 노학동, 서귀포시 대정읍, 서귀포시 영천동이에요.',
    )
  })

  it('응답 모양: 질문은 앞뒤 공백 제거, rule, 예시 = 고른 의도를 뺀 대표 질문 3개', () => {
    expect(askMock(JUMUNJIN, '  이 동네 조용해?  ')).toEqual({
      question: '이 동네 조용해?',
      answer: ['조용함은 B등급(31점)이에요.'],
      intents: ['quiet'],
      source: 'rule',
      examples: [
        '평일엔 몇 시가 붐비고 몇 시가 한산해?',
        '주말엔 몇 시가 붐비고 몇 시가 한산해?',
        '1년 중 언제 가면 한산해?',
      ],
    })
  })

  it('금암동(내륙): 바다 질문 → 1km 넘게', () => {
    expect(askMock(GEUMAM, '바다가 가까워?')!.answer).toEqual([
      '해안선에서 1km 넘게 떨어진 동네예요.',
    ])
  })

  it('밥·맛집·카페 → guide + 안내 예시', () => {
    for (const q of ['밥먹기 좋아?', '맛집 있어?', '카페 많아?']) {
      const res = askMock(JUMUNJIN, q)!
      expect(res.source).toBe('guide')
      expect(res.intents).toEqual([])
      expect(res.answer[0]).toMatch(/^이 지도는 동네의 붐빔과 분위기를 보고 있어서 식당·카페는/)
      expect(res.examples).toEqual([
        '평일엔 몇 시가 붐비고 몇 시가 한산해?',
        '저녁에 활기 있어?',
        '이 동네 조용해?',
      ])
    }
  })

  it('맞는 의도가 없으면 그 밖 안내', () => {
    const res = askMock(JUMUNJIN, '날씨 어때?')!
    expect(res.source).toBe('guide')
    expect(res.answer[0]).toMatch(/그 질문엔 아직 답하기 어려워요/)
  })

  it('그 밖의 동도 결정적으로 답한다, 없는 동은 null', () => {
    expect(askMock('5121057000', '이 동네 조용해?')).toEqual(
      askMock('5121057000', '이 동네 조용해?'),
    )
    expect(askMock('5121057000', '이 동네 조용해?')!.answer[0]).toMatch(/^조용함은 [SABC]등급/)
    expect(askMock('0000000000', '이 동네 조용해?')).toBeNull()
  })
})
