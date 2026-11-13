import type { ReactNode } from 'react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { act, renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

vi.mock('@/features/explore/api', () => ({ askDong: vi.fn() }))

import { askDong } from '@/features/explore/api'
import { exploreKeys } from '@/features/explore/queryKeys'
import type { AskResponse } from '@/features/explore/types'
import { askErrorKind, useAskThread } from '@/features/explore/useAskThread'
import { NotFoundError } from '@/lib/errors'

const mocked = vi.mocked(askDong)
const A = '5115025000'
const B = '5211357500'

const reply = (answer: string, examples = ['다음 1', '다음 2', '다음 3']): AskResponse => ({
  question: 'q',
  answer: [answer],
  intents: ['quiet'],
  source: 'rule',
  examples,
})

function setup(dongId = A) {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  const Wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={client}>{children}</QueryClientProvider>
  )
  const hook = renderHook(({ id }) => useAskThread(id), {
    wrapper: Wrapper,
    initialProps: { id: dongId },
  })
  return { client, ...hook }
}

beforeEach(() => {
  mocked.mockReset()
})

describe('askErrorKind', () => {
  it('429 → limit, 400 → invalid, 그 밖 → retry', () => {
    expect(askErrorKind(new Error('API 429 Too Many Requests: /x'))).toBe('limit')
    expect(askErrorKind(new Error('API 400 Bad Request: /x'))).toBe('invalid')
    expect(askErrorKind(new Error('API 503 Service Unavailable: /x'))).toBe('retry')
    expect(askErrorKind(new TypeError('Failed to fetch'))).toBe('retry')
    expect(askErrorKind(new NotFoundError('/x'))).toBe('retry')
  })
})

describe('useAskThread', () => {
  it('처음: 기록 없음, 첫 칩 3개, 서버 요청 없음', () => {
    const { result } = setup()
    expect(result.current.thread).toEqual({
      turns: [],
      examples: [
        '이 동네 조용해?',
        '평일엔 몇 시가 붐비고 몇 시가 한산해?',
        '비슷한 동네는 어디야?',
      ],
    })
    expect(result.current.pending).toBe(false)
    expect(mocked).not.toHaveBeenCalled()
  })

  it('ask: 대기 차례가 바로 붙고, 답이 오면 done + 예시 교체', async () => {
    let resolve!: (r: AskResponse) => void
    mocked.mockReturnValue(new Promise((r) => (resolve = r)))
    const { result } = setup()
    await act(async () => result.current.ask('  이 동네 조용해?  '))
    expect(mocked).toHaveBeenCalledWith(A, '이 동네 조용해?')
    // QueryClient 알림은 setTimeout 0 으로 묶여 오므로 waitFor 로 기다린다
    await waitFor(() => expect(result.current.pending).toBe(true))
    expect(result.current.thread.turns).toEqual([
      { id: expect.any(String), question: '이 동네 조용해?', status: 'pending' },
    ])
    await act(async () => resolve(reply('조용함은 B등급(31점)이에요.')))
    await waitFor(() => expect(result.current.pending).toBe(false))
    expect(result.current.thread.turns[0]).toMatchObject({
      status: 'done',
      answer: ['조용함은 B등급(31점)이에요.'],
      source: 'rule',
    })
    expect(result.current.thread.examples).toEqual(['다음 1', '다음 2', '다음 3'])
  })

  it('빈 질문·대기 중 질문은 무시', async () => {
    mocked.mockReturnValue(new Promise(() => {}))
    const { result } = setup()
    await act(async () => result.current.ask('   '))
    expect(mocked).not.toHaveBeenCalled()
    await act(async () => result.current.ask('하나'))
    await act(async () => result.current.ask('둘'))
    expect(mocked).toHaveBeenCalledOnce()
    await waitFor(() => expect(result.current.thread.turns).toHaveLength(1))
  })

  it('503 → retry 오류, retry → 같은 차례가 성공으로 바뀐다', async () => {
    mocked.mockRejectedValueOnce(new Error('API 503 Service Unavailable: /x'))
    const { result } = setup()
    await act(async () => result.current.ask('이 동네 조용해?'))
    await waitFor(() => expect(result.current.thread.turns[0].status).toBe('error'))
    const turn = result.current.thread.turns[0]
    expect(turn).toMatchObject({ kind: 'retry' })
    expect(result.current.thread.examples[0]).toBe('이 동네 조용해?')

    mocked.mockResolvedValueOnce(reply('조용함은 B등급(31점)이에요.'))
    await act(async () => result.current.retry(turn.id))
    await waitFor(() => expect(result.current.thread.turns[0].status).toBe('done'))
    expect(result.current.thread.turns).toHaveLength(1)
    expect(result.current.thread.turns[0].id).toBe(turn.id)
    expect(mocked).toHaveBeenCalledTimes(2)
  })

  it('429 → limit', async () => {
    mocked.mockRejectedValue(new Error('API 429 Too Many Requests: /x'))
    const { result } = setup()
    await act(async () => result.current.ask('이 동네 조용해?'))
    await waitFor(() => expect(result.current.thread.turns[0]).toMatchObject({ kind: 'limit' }))
  })

  it('동 A → B → A: 기록이 동별로 남는다', async () => {
    mocked.mockResolvedValue(reply('A 답'))
    const { result, rerender, client } = setup(A)
    await act(async () => result.current.ask('A 질문'))
    await waitFor(() => expect(result.current.pending).toBe(false))

    rerender({ id: B })
    expect(result.current.thread.turns).toEqual([])
    rerender({ id: A })
    expect(result.current.thread.turns.map((t) => t.question)).toEqual(['A 질문'])
    expect(client.getQueryCache().find({ queryKey: exploreKeys.askThread(A) })?.gcTime).toBe(
      Infinity,
    )
  })

  it('답이 오기 전에 동을 바꾸면 질문한 동의 기록에 붙는다', async () => {
    let resolve!: (r: AskResponse) => void
    mocked.mockReturnValue(new Promise((r) => (resolve = r)))
    const { result, rerender, client } = setup(A)
    await act(async () => result.current.ask('A 질문'))
    rerender({ id: B })
    await act(async () => resolve(reply('A 답')))
    expect(client.getQueryData(exploreKeys.askThread(A))).toMatchObject({
      turns: [{ question: 'A 질문', status: 'done', answer: ['A 답'] }],
    })
    expect(result.current.thread.turns).toEqual([])
  })
})
