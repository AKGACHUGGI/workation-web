import { beforeEach, describe, expect, it, vi } from 'vitest'
import { screen, waitFor, within } from '@testing-library/react'
import { useQuery } from '@tanstack/react-query'
import userEvent from '@testing-library/user-event'
import { deleteMyTip } from '@/features/me/api'
import {
  createReply,
  deleteReply,
  fetchReplies,
  setHelpful,
  updateNote,
} from '@/features/region/api'
import TipCard from '@/features/region/components/TipCard'
import { regionKeys } from '@/features/region/queryKeys'
import type { Note, NotesResponse } from '@/features/region/types'
import { DUI } from '@/mocks/auth/me'
import renderWithAuth from '@/test/renderWithAuth'

vi.mock('@/features/region/api', () => ({
  updateNote: vi.fn(),
  setHelpful: vi.fn(),
  fetchReplies: vi.fn(),
  createReply: vi.fn(),
  deleteReply: vi.fn(),
}))
vi.mock('@/features/me/api', () => ({ deleteMyTip: vi.fn() }))

const ME = { ...DUI, needsOnboarding: false }
const KEY = regionKeys.notes('51210', { sort: 'helpful' })
const NOTE: Note = {
  id: '7',
  author: { nickname: '바다', initial: '바' },
  createdAt: '2025-10-01T00:00:00Z',
  body: '조용해요',
  helpful: 2,
  replies: 0,
  photos: [{ id: '31', url: 'https://r2.example/uploads/tip/a.webp' }],
}
const MINE: Note = { ...NOTE, id: '8', author: { nickname: '두이', initial: '두' }, mine: true }

/** 목록 쿼리로 읽어 그린다 (뮤테이션이 캐시를 고치면 카드도 바뀐다) */
function FromCache({ note }: { note: Note }) {
  const { data } = useQuery<NotesResponse>({
    queryKey: KEY,
    queryFn: () => Promise.resolve({ total: 1, items: [note] }),
    staleTime: Infinity,
  })
  const n = data?.items.find((x) => x.id === note.id)
  return n ? <TipCard note={n} /> : <p>없음</p>
}

async function renderCard(note: Note, me: typeof ME | null = ME) {
  const view = renderWithAuth(<FromCache note={note} />, { me })
  await screen.findByRole('article')
  return view
}

describe('TipCard', () => {
  beforeEach(() => vi.clearAllMocks())

  it('붙인 사진을 보여 준다', async () => {
    await renderCard(NOTE)
    expect(screen.getByRole('img', { name: '바다의 사진 1' })).toHaveAttribute(
      'src',
      NOTE.photos![0].url,
    )
  })

  it('남의 팁: 신고는 있고 수정·삭제는 없다. 도움돼요 누르면 바로 +1, 응답으로 확정', async () => {
    vi.mocked(setHelpful).mockResolvedValue({ helpful: 3, myHelpful: true })
    await renderCard(NOTE)
    expect(screen.queryByRole('button', { name: '수정' })).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: /신고/ })).toBeInTheDocument()
    const helpful = screen.getByRole('button', { name: /도움돼요/ })
    await userEvent.click(helpful)
    expect(setHelpful).toHaveBeenCalledWith('7', true)
    await waitFor(() => expect(helpful).toHaveAttribute('aria-pressed', 'true'))
    expect(helpful).toHaveTextContent('도움돼요 3')
  })

  it('도움돼요 실패하면 되돌린다', async () => {
    vi.mocked(setHelpful).mockRejectedValue(new Error('API 500'))
    await renderCard(NOTE)
    await userEvent.click(screen.getByRole('button', { name: /도움돼요/ }))
    await waitFor(() => expect(screen.getByRole('status')).toHaveTextContent('저장하지 못했어요'))
    expect(screen.getByRole('button', { name: /도움돼요/ })).toHaveTextContent('도움돼요 2')
  })

  it('내 팁: 도움돼요는 누를 수 없고, 수정해 저장하면 바뀐다', async () => {
    vi.mocked(updateNote).mockResolvedValue({ ...MINE, body: '고친 팁' })
    await renderCard(MINE)
    await userEvent.click(screen.getByRole('button', { name: /도움돼요/ }))
    expect(setHelpful).not.toHaveBeenCalled()
    expect(screen.getByRole('status')).toHaveTextContent('내 팁에는 도움돼요를 누를 수 없어요')
    expect(screen.queryByRole('button', { name: /신고/ })).not.toBeInTheDocument()
    await userEvent.click(screen.getByRole('button', { name: '수정' }))
    const box = screen.getByRole('textbox', { name: '팁 고치기' })
    await userEvent.clear(box)
    await userEvent.type(box, '고친 팁')
    await userEvent.click(screen.getByRole('button', { name: '저장' }))
    expect(updateNote).toHaveBeenCalledWith('8', '고친 팁')
    await waitFor(() => expect(screen.getByText('고친 팁')).toBeInTheDocument())
    expect(screen.queryByRole('textbox', { name: '팁 고치기' })).not.toBeInTheDocument()
  })

  it('내 팁 삭제: 확인 후 목록에서 빠진다', async () => {
    vi.mocked(deleteMyTip).mockResolvedValue(undefined)
    const { client } = await renderCard(MINE)
    await userEvent.click(screen.getByRole('button', { name: '삭제' }))
    const dialog = screen.getByRole('dialog')
    await userEvent.click(within(dialog).getByRole('button', { name: '삭제' }))
    expect(deleteMyTip).toHaveBeenCalledWith('8', expect.anything())
    await waitFor(() => expect(client.getQueryData<NotesResponse>(KEY)?.items).toEqual([]))
    expect(client.getQueryData<NotesResponse>(KEY)?.total).toBe(0)
  })

  it('답글: 펼치면 불러오고, 쓰면 목록과 수가 늘고, 내 답글은 지운다', async () => {
    vi.mocked(fetchReplies).mockResolvedValue({ items: [] })
    vi.mocked(createReply).mockResolvedValue({
      id: '91',
      author: { nickname: '두이', initial: '두' },
      createdAt: new Date().toISOString(),
      body: '고마워요',
      mine: true,
    })
    vi.mocked(deleteReply).mockResolvedValue(undefined)
    await renderCard(NOTE)
    await userEvent.click(screen.getByRole('button', { name: /답글 0/ }))
    expect(fetchReplies).toHaveBeenCalledWith('7')
    await userEvent.type(screen.getByRole('textbox', { name: '답글' }), '고마워요{Enter}')
    expect(createReply).toHaveBeenCalledWith('7', '고마워요')
    await waitFor(() => expect(screen.getByText('고마워요')).toBeInTheDocument())
    expect(screen.getByRole('button', { name: /답글 1/ })).toBeInTheDocument()
    await userEvent.click(screen.getByRole('button', { name: '삭제' }))
    await waitFor(() => expect(screen.queryByText('고마워요')).not.toBeInTheDocument())
    expect(screen.getByRole('button', { name: /답글 0/ })).toBeInTheDocument()
  })

  it('비로그인: 도움돼요는 로그인 모달만', async () => {
    await renderCard(NOTE, null)
    await userEvent.click(screen.getByRole('button', { name: /도움돼요/ }))
    expect(setHelpful).not.toHaveBeenCalled()
    expect(screen.getByRole('dialog', { name: '당신의 장소를 찾으세요' })).toBeInTheDocument()
  })
})
