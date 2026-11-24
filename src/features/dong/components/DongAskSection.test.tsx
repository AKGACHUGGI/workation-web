import { beforeEach, describe, expect, it, vi } from 'vitest'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import renderWithRouter from '@/test/renderWithRouter'

vi.mock('@/features/chat/api', () => ({ postChat: vi.fn() }))

import { postChat } from '@/features/chat/api'
import DongAskSection from '@/features/dong/components/DongAskSection'

const mocked = vi.mocked(postChat)
const scrollSpy = vi.fn()

beforeEach(() => {
  mocked.mockReset()
  scrollSpy.mockReset()
  Element.prototype.scrollIntoView = scrollSpy
})

describe('DongAskSection', () => {
  it('제목·브리핑 없음·동 예시, 질문은 surface dong + 페이지 달로 간다', async () => {
    mocked.mockResolvedValue({
      conversationId: 'c-1',
      scope: 'dong',
      dongs: [{ id: '5182025300', name: '거진읍' }],
      intent: 'quiet',
      sentences: [{ text: '조용함은 B등급이에요.', source: 'rule' }],
      guide: null,
      examples: [],
    })
    renderWithRouter(<DongAskSection dongId="5182025300" month="2025-10" />)
    expect(screen.getByRole('heading', { name: '이 동네에 물어보기' })).toBeInTheDocument()
    expect(screen.queryByText('이 동네에서 일하는 하루')).not.toBeInTheDocument()
    await userEvent.click(screen.getByRole('button', { name: '이 동네 조용해?' }))
    expect(mocked).toHaveBeenCalledWith(
      expect.objectContaining({ surface: 'dong', panel: '5182025300', month: '2025-10' }),
    )
    expect(await screen.findByText('조용함은 B등급이에요.')).toBeInTheDocument()
  })

  it('#ask 로 들어오면 섹션으로 내린다', () => {
    renderWithRouter(<DongAskSection dongId="5182025300" month="2025-10" />, {
      route: '/dongs/5182025300?month=2025-10#ask',
    })
    expect(document.getElementById('ask')).not.toBeNull()
    expect(scrollSpy).toHaveBeenCalledWith({ block: 'start' })
  })
})
