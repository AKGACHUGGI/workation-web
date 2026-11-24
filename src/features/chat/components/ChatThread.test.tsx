import { useState } from 'react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { fireEvent, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import renderWithRouter from '@/test/renderWithRouter'
import { GEUMAM, JUMUNJIN } from '@/test/fixtures/explore'

vi.mock('@/features/chat/api', () => ({ postChat: vi.fn() }))

import { postChat } from '@/features/chat/api'
import ChatThread from '@/features/chat/components/ChatThread'
import type { ChatResponse } from '@/features/chat/types'

const mocked = vi.mocked(postChat)
const FIRST = ['이 동네 조용해?', '평일엔 몇 시가 붐비고 몇 시가 한산해?', '비슷한 동네는 어디야?']
const NEXT = [
  '평일엔 몇 시가 붐비고 몇 시가 한산해?',
  '주말엔 몇 시가 붐비고 몇 시가 한산해?',
  '1년 중 언제 가면 한산해?',
]
const reply = (texts: string[], guide: string | null = null): ChatResponse => ({
  conversationId: 'c-1',
  dongs: [{ id: JUMUNJIN.id, name: JUMUNJIN.name }],
  intent: 'quiet',
  sentences: texts.map((text) => ({ text, source: 'llm' })),
  guide,
  examples: NEXT,
})
const chips = () =>
  within(screen.getByRole('group', { name: '예시 질문' }))
    .getAllByRole('button')
    .map((c) => c.textContent)
const log = () => screen.getByRole('log', { name: '물어본 대화' })
const input = () => screen.getByRole('textbox', { name: '이 동네에 물어보기' })
const send = () => screen.getByRole('button', { name: '보내기' })

/** DongPanel 처럼 동이 바뀌면 key 로 다시 만든다 */
function DongSwitch() {
  const [dong, setDong] = useState(JUMUNJIN)
  return (
    <>
      <button type="button" onClick={() => setDong(GEUMAM)}>
        금암동으로
      </button>
      <button type="button" onClick={() => setDong(JUMUNJIN)}>
        주문진읍으로
      </button>
      <ChatThread key={dong.id} dong={dong} />
    </>
  )
}

const scrollSpy = vi.fn()
beforeEach(() => {
  mocked.mockReset()
  scrollSpy.mockReset()
  Element.prototype.scrollIntoView = scrollSpy
})
afterEach(() => {
  // @ts-expect-error jsdom 에는 없는 메서드를 테스트에서만 붙였다
  delete Element.prototype.scrollIntoView
})

describe('ChatThread', () => {
  it('처음: 브리핑 + 빈 대화 + 첫 예시 3개 + 알약 입력, 보내기는 비활성(연한 Rausch)', () => {
    renderWithRouter(<ChatThread dong={JUMUNJIN} />)
    expect(screen.getByRole('heading', { name: '이 동네에서 일하는 하루' })).toBeInTheDocument()
    expect(screen.getByText(JUMUNJIN.briefing.join(' '))).toBeInTheDocument()
    expect(log()).toHaveAttribute('aria-live', 'polite')
    expect(log()).toBeEmptyDOMElement()
    expect(log()).toHaveClass('max-h-72', 'overflow-y-auto')
    expect(chips()).toEqual(FIRST)
    expect(input().parentElement).toHaveClass('rounded-full')
    expect(send()).toBeDisabled()
    expect(send()).toHaveClass('rounded-full', 'bg-brand-primary', 'disabled:bg-rausch-100')
  })

  it('예시 질문 → 질문 말풍선(brand-soft)·대기(칩·입력 비활성) → 답, 예시가 응답 examples 로 바뀐다', async () => {
    let resolve!: (r: ChatResponse) => void
    mocked.mockReturnValue(new Promise((r) => (resolve = r)))
    renderWithRouter(<ChatThread dong={JUMUNJIN} />)
    await userEvent.click(screen.getByRole('button', { name: FIRST[0] }))
    expect(mocked).toHaveBeenCalledWith(
      expect.objectContaining({ panel: JUMUNJIN.id, question: FIRST[0] }),
    )
    expect(mocked.mock.calls[0][0].criteria.chips).toEqual([])
    expect(await within(log()).findByText('답을 기다리는 중')).toHaveClass('sr-only')
    expect(within(log()).getByText(FIRST[0])).toHaveClass(
      'bg-brand-soft',
      'border-brand-soft-border',
    )
    expect(input()).toBeDisabled()
    expect(screen.getByRole('button', { name: FIRST[1] })).toBeDisabled()

    resolve(reply(['조용함은 B등급(31점)이에요.']))
    expect(await within(log()).findByText('조용함은 B등급(31점)이에요.')).toHaveClass(
      'text-text-primary',
    )
    expect(chips()).toEqual(NEXT)
    expect(input()).toBeEnabled()
    expect(scrollSpy).toHaveBeenCalledWith({ block: 'nearest', behavior: 'smooth' })
  })

  it('답 문장은 한 문단으로 잇고, guide 는 회색으로 문단 위에', async () => {
    mocked.mockResolvedValueOnce(
      reply(
        ['조용히 일하려면 주문진읍이 맞아요.', '반면 또래가 많은 곳은 경포동이에요.'],
        '앞의 세 곳만 볼게요.',
      ),
    )
    renderWithRouter(<ChatThread dong={JUMUNJIN} />)
    await userEvent.type(input(), '경포동이랑 비교하면?{Enter}')
    const guide = await within(log()).findByText('앞의 세 곳만 볼게요.')
    expect(guide).toHaveClass('text-text-secondary')
    const answer = within(log()).getByText(
      '조용히 일하려면 주문진읍이 맞아요. 반면 또래가 많은 곳은 경포동이에요.',
    )
    expect(answer.tagName).toBe('P')
    expect(answer).toHaveClass('text-text-primary')
    expect(guide.compareDocumentPosition(answer) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
  })

  it('입력 Enter 로 보내고 비워진다, 질문은 아래로 쌓인다', async () => {
    mocked.mockResolvedValueOnce(reply(['첫 답'])).mockResolvedValueOnce(reply(['둘째 답']))
    renderWithRouter(<ChatThread dong={JUMUNJIN} />)
    await userEvent.type(input(), '아침에 조용해?{Enter}')
    expect(input()).toHaveValue('')
    await within(log()).findByText('첫 답')
    await userEvent.type(input(), '저녁엔?{Enter}')
    await within(log()).findByText('둘째 답')
    expect(log().textContent).toBe('아침에 조용해?첫 답저녁엔?둘째 답')
    expect(mocked.mock.calls[1][0].conversationId).toBe('c-1')
  })

  it('한글 조합 중 Enter 는 보내지 않는다', () => {
    renderWithRouter(<ChatThread dong={JUMUNJIN} />)
    fireEvent.change(input(), { target: { value: '조용해' } })
    fireEvent.keyDown(input(), { key: 'Enter', isComposing: true })
    fireEvent.keyDown(input(), { key: 'Enter', keyCode: 229 })
    expect(mocked).not.toHaveBeenCalled()
    expect(input()).toHaveValue('조용해')
  })

  it('100자에서 더 입력되지 않고 글자 수를 보인다', async () => {
    renderWithRouter(<ChatThread dong={JUMUNJIN} />)
    await userEvent.type(input(), '가'.repeat(98))
    expect(screen.getByText('98/100')).toBeInTheDocument()
    await userEvent.type(input(), '나나나')
    expect(input()).toHaveValue('가'.repeat(98) + '나나')
    expect(screen.getByText('100/100')).toBeInTheDocument()
  })

  it('guide 만 온 답(모르는 질문·다른 시군구)은 회색 안내', async () => {
    mocked.mockResolvedValueOnce(reply([], '지금은 같은 시군구 안의 동네끼리만 비교할 수 있어요.'))
    renderWithRouter(<ChatThread dong={JUMUNJIN} />)
    await userEvent.type(input(), '효자2동이랑 비교해 줘{Enter}')
    expect(
      await within(log()).findByText('지금은 같은 시군구 안의 동네끼리만 비교할 수 있어요.'),
    ).toHaveClass('text-text-secondary')
  })

  it('503 → 다시 시도 → 성공', async () => {
    mocked
      .mockRejectedValueOnce(new Error('API 503 Service Unavailable: /x'))
      .mockResolvedValueOnce(reply(['조용함은 B등급(31점)이에요.']))
    renderWithRouter(<ChatThread dong={JUMUNJIN} />)
    await userEvent.type(input(), '이 동네 조용해?{Enter}')
    expect(await within(log()).findByText('지금은 답을 가져오지 못했어요.')).toBeInTheDocument()
    await userEvent.click(within(log()).getByRole('button', { name: '다시 시도' }))
    expect(await within(log()).findByText('조용함은 B등급(31점)이에요.')).toBeInTheDocument()
    expect(within(log()).queryByText('지금은 답을 가져오지 못했어요.')).not.toBeInTheDocument()
    expect(mocked).toHaveBeenCalledTimes(2)
  })

  it('429 → 잠시 후 문구, 다시 시도 없음', async () => {
    mocked.mockRejectedValue(new Error('API 429 Too Many Requests: /x'))
    renderWithRouter(<ChatThread dong={JUMUNJIN} />)
    await userEvent.type(input(), '이 동네 조용해?{Enter}')
    expect(await within(log()).findByText('잠시 후 다시 물어봐 주세요.')).toBeInTheDocument()
    expect(within(log()).queryByRole('button', { name: '다시 시도' })).not.toBeInTheDocument()
  })

  it('동 A → B → A: 기록이 남고, 돌아올 때는 내리지 않는다', async () => {
    mocked.mockResolvedValue(reply(['주문진 답']))
    renderWithRouter(<DongSwitch />)
    await userEvent.type(input(), '이 동네 조용해?{Enter}')
    await within(log()).findByText('주문진 답')
    scrollSpy.mockReset()

    await userEvent.click(screen.getByRole('button', { name: '금암동으로' }))
    expect(log()).toBeEmptyDOMElement()
    await userEvent.click(screen.getByRole('button', { name: '주문진읍으로' }))
    expect(within(log()).getByText('주문진 답')).toBeInTheDocument()
    expect(scrollSpy).not.toHaveBeenCalled()
  })
})
