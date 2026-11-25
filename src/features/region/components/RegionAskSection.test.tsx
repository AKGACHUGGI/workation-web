import { beforeEach, describe, expect, it, vi } from 'vitest'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import renderWithRouter from '@/test/renderWithRouter'

vi.mock('@/features/chat/api', () => ({ postChat: vi.fn() }))

import { postChat } from '@/features/chat/api'
import RegionAskSection from '@/features/region/components/RegionAskSection'

const mocked = vi.mocked(postChat)

beforeEach(() => {
  mocked.mockReset()
  Element.prototype.scrollIntoView = vi.fn()
})

describe('RegionAskSection', () => {
  it('"{시군구}에 물어보기", surface region 요청, 찾은 동 "자세히 →" 링크', async () => {
    mocked.mockResolvedValue({
      conversationId: 'c-1',
      scope: 'region',
      dongs: [{ id: '4511164500', name: '효자2동' }],
      intent: 'find_quiet',
      sentences: [{ text: '조용함을 원한다면 효자2동이 맞아요.', source: 'rule' }],
      guide: null,
      examples: ['효자2동은 저녁에 어때?'],
    })
    renderWithRouter(
      <RegionAskSection
        sigunguId="45111"
        name="전주시"
        month="2025-10"
        dongHref={(id) => `/dongs/${id}?month=2025-10`}
      />,
    )
    expect(screen.getByRole('heading', { name: '전주시에 물어보기' })).toBeInTheDocument()
    await userEvent.type(
      screen.getByRole('textbox', { name: '전주시에 물어보기' }),
      '조용한 동네 어디야?{Enter}',
    )
    expect(mocked).toHaveBeenCalledWith(
      expect.objectContaining({ surface: 'region', sigungu: '45111', month: '2025-10' }),
    )
    expect(await screen.findByRole('link', { name: '효자2동 자세히 →' })).toHaveAttribute(
      'href',
      '/dongs/4511164500?month=2025-10',
    )
  })
})
