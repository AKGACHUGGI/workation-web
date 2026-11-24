import { describe, expect, it } from 'vitest'
import { postChat } from '@/features/chat/api'
import { chatKeys } from '@/features/chat/queryKeys'
import { NotFoundError } from '@/lib/errors'

describe('chatKeys', () => {
  it('동마다 로컬 기록 키', () => {
    expect(chatKeys.dong('5115025000')).toEqual(['chat', 'dong', '5115025000'])
    expect(chatKeys.region('45111')).toEqual(['chat', 'region', '45111'])
  })
})

describe('postChat (mock)', () => {
  it('채팅: 주문진읍 조용함, 없는 동은 NotFoundError', async () => {
    const body = {
      conversationId: null,
      surface: 'dong' as const,
      panel: '5115025000',
      month: null,
      question: '이 동네 조용해?',
      criteria: { chips: [], interest: { metric: {}, terrain: {}, recent: [] } },
    }
    expect(await postChat(body)).toMatchObject({
      conversationId: 'mock-5115025000',
      sentences: [{ text: '조용함은 B등급(31점)이에요.', source: 'rule' }],
    })
    await expect(postChat({ ...body, panel: '0000000000' })).rejects.toBeInstanceOf(NotFoundError)
  })
})
