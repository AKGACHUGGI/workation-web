import { useState } from 'react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { fireEvent, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import renderWithRouter from '@/test/renderWithRouter'
import { GEUMAM, JUMUNJIN } from '@/test/fixtures/explore'

vi.mock('@/features/explore/api', () => ({ askDong: vi.fn() }))

import { askDong } from '@/features/explore/api'
import AskThread from '@/features/explore/components/panel/AskThread'
import type { AskResponse } from '@/features/explore/types'

const mocked = vi.mocked(askDong)
const NEXT = [
  '평일엔 몇 시가 붐비고 몇 시가 한산해?',
  '주말엔 몇 시가 붐비고 몇 시가 한산해?',
  '1년 중 언제 가면 한산해?',
]
const reply = (answer: string, source: AskResponse['source'] = 'rule'): AskResponse => ({
  question: 'q',
  answer: [answer],
  intents: ['quiet'],
  source,
  examples: NEXT,
})
const chips = () => within(screen.getByRole('group', { name: '예시 질문' })).getAllByRole('button')
const log = () => screen.getByRole('log', { name: '물어본 대화' })
const input = () => screen.getByRole('textbox', { name: '이 동네에 물어보기' })

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
      <AskThread key={dong.id} dong={dong} />
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

describe('AskThread', () => {
  it('처음: 브리핑 + 빈 대화 + 첫 칩 3개 + 입력', () => {
    renderWithRouter(<AskThread dong={JUMUNJIN} />)
    expect(screen.getByRole('heading', { name: '이 동네에서 일하는 하루' })).toBeInTheDocument()
    expect(screen.getByText(JUMUNJIN.briefing.join(' '))).toBeInTheDocument()
    expect(log()).toHaveAttribute('aria-live', 'polite')
    expect(log()).toBeEmptyDOMElement()
    expect(chips().map((c) => c.textContent)).toEqual([
      '이 동네 조용해?',
      '평일엔 몇 시가 붐비고 몇 시가 한산해?',
      '비슷한 동네는 어디야?',
    ])
    expect(screen.getByRole('button', { name: '보내기' })).toBeDisabled()
  })

  it('칩 → 질문·대기(칩·입력 비활성) → 답, 칩이 응답 examples 로 바뀌고 말풍선으로 내린다', async () => {
    let resolve!: (r: AskResponse) => void
    mocked.mockReturnValue(new Promise((r) => (resolve = r)))
    renderWithRouter(<AskThread dong={JUMUNJIN} />)
    await userEvent.click(screen.getByRole('button', { name: '이 동네 조용해?' }))
    expect(mocked).toHaveBeenCalledWith(JUMUNJIN.id, '이 동네 조용해?')
    expect(await within(log()).findByText('답을 기다리는 중')).toHaveClass('sr-only')
    expect(within(log()).getByText('이 동네 조용해?')).toBeInTheDocument()
    for (const c of chips()) expect(c).toBeDisabled()
    expect(input()).toBeDisabled()

    resolve(reply('조용함은 B등급(31점)이에요.'))
    expect(await within(log()).findByText('조용함은 B등급(31점)이에요.')).toHaveClass(
      'text-text-primary',
    )
    expect(chips().map((c) => c.textContent)).toEqual(NEXT)
    expect(input()).toBeEnabled()
    expect(scrollSpy).toHaveBeenCalledWith({ block: 'nearest', behavior: 'smooth' })
  })

  it('입력 Enter 로 보내고 입력이 비워진다, 질문은 아래로 쌓인다', async () => {
    mocked.mockResolvedValueOnce(reply('첫 답')).mockResolvedValueOnce(reply('둘째 답'))
    renderWithRouter(<AskThread dong={JUMUNJIN} />)
    await userEvent.type(input(), '아침에 조용해?{Enter}')
    expect(input()).toHaveValue('')
    await within(log()).findByText('첫 답')
    await userEvent.type(input(), '저녁엔?{Enter}')
    await within(log()).findByText('둘째 답')
    expect(log().textContent).toBe('아침에 조용해?첫 답저녁엔?둘째 답')
  })

  it('한글 조합 중 Enter 는 보내지 않는다', () => {
    renderWithRouter(<AskThread dong={JUMUNJIN} />)
    fireEvent.change(input(), { target: { value: '조용해' } })
    fireEvent.keyDown(input(), { key: 'Enter', isComposing: true })
    fireEvent.keyDown(input(), { key: 'Enter', keyCode: 229 })
    expect(mocked).not.toHaveBeenCalled()
    expect(input()).toHaveValue('조용해')
  })

  it('100자에서 더 입력되지 않고 글자 수를 보인다', async () => {
    renderWithRouter(<AskThread dong={JUMUNJIN} />)
    await userEvent.type(input(), '가'.repeat(98))
    expect(screen.getByText('98/100')).toBeInTheDocument()
    await userEvent.type(input(), '나나나')
    expect(input()).toHaveValue('가'.repeat(98) + '나나')
    expect(screen.getByText('100/100')).toBeInTheDocument()
  })

  it('guide → 안내 문구는 text-secondary', async () => {
    mocked.mockResolvedValue(reply('이 지도는 … 식당·카페는 아직 몰라요.', 'guide'))
    renderWithRouter(<AskThread dong={JUMUNJIN} />)
    await userEvent.type(input(), '맛집 있어?{Enter}')
    expect(await within(log()).findByText('이 지도는 … 식당·카페는 아직 몰라요.')).toHaveClass(
      'text-text-secondary',
    )
  })

  it('503 → 다시 시도 → 성공', async () => {
    mocked
      .mockRejectedValueOnce(new Error('API 503 Service Unavailable: /x'))
      .mockResolvedValueOnce(reply('조용함은 B등급(31점)이에요.'))
    renderWithRouter(<AskThread dong={JUMUNJIN} />)
    await userEvent.click(screen.getByRole('button', { name: '이 동네 조용해?' }))
    expect(await within(log()).findByText('지금은 답을 가져오지 못했어요.')).toBeInTheDocument()
    await userEvent.click(within(log()).getByRole('button', { name: '다시 시도' }))
    expect(await within(log()).findByText('조용함은 B등급(31점)이에요.')).toBeInTheDocument()
    expect(within(log()).queryByText('지금은 답을 가져오지 못했어요.')).not.toBeInTheDocument()
    expect(mocked).toHaveBeenCalledTimes(2)
  })

  it('429 → 잠시 후 문구, 다시 시도 없음', async () => {
    mocked.mockRejectedValue(new Error('API 429 Too Many Requests: /x'))
    renderWithRouter(<AskThread dong={JUMUNJIN} />)
    await userEvent.click(screen.getByRole('button', { name: '이 동네 조용해?' }))
    expect(await within(log()).findByText('잠시 후 다시 물어봐 주세요.')).toBeInTheDocument()
    expect(within(log()).queryByRole('button', { name: '다시 시도' })).not.toBeInTheDocument()
  })

  it('동 A → B → A: 기록이 남고, 돌아올 때는 내리지 않는다', async () => {
    mocked.mockResolvedValue(reply('주문진 답'))
    renderWithRouter(<DongSwitch />)
    await userEvent.click(screen.getByRole('button', { name: '이 동네 조용해?' }))
    await within(log()).findByText('주문진 답')
    scrollSpy.mockReset()

    await userEvent.click(screen.getByRole('button', { name: '금암동으로' }))
    expect(log()).toBeEmptyDOMElement()
    await userEvent.click(screen.getByRole('button', { name: '주문진읍으로' }))
    expect(within(log()).getByText('주문진 답')).toBeInTheDocument()
    expect(scrollSpy).not.toHaveBeenCalled()
  })
})
