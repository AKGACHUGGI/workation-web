import { beforeEach, describe, expect, it, vi } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import renderWithRouter from '@/test/renderWithRouter'
import { applyVote } from '@/features/region/pollVote'
import type { PollChoice, PollResponse, PollTarget } from '@/features/region/types'

const openLogin = vi.fn()
const show = vi.fn()
let loggedIn = true

vi.mock('@/features/auth/useAuth', () => ({
  useAuth: () => ({ me: loggedIn ? { id: 'u1' } : null, isPending: false, isLoggedIn: loggedIn }),
}))
vi.mock('@/features/auth/useRequireLogin', () => ({
  useRequireLogin: () => (action: () => void) => (loggedIn ? action() : openLogin(action)),
}))
vi.mock('@/components/ui/toast/useToast', () => ({ useToast: () => ({ show }) }))

const BASE: PollResponse = { question: '조용했나요?', yes: 3, no: 1, total: 4, photos: [] }
// 서버 상태. 투표 POST 가 바꾸고 응답으로 돌려준다
let server: PollResponse = BASE
let failVote = false
const votePoll = vi.fn()
const uploadMonthPhotos = vi.fn()
vi.mock('@/features/region/api', () => ({
  uploadMonthPhotos: (...args: unknown[]) => uploadMonthPhotos(...args),
  fetchRegionPoll: () => Promise.resolve(server),
  votePoll: (t: PollTarget, choice: PollChoice | null) => {
    votePoll(t, choice)
    if (failVote) return Promise.reject(new Error('API 404'))
    server = applyVote(server, choice)
    return Promise.resolve(server)
  },
}))

import PollSection from '@/features/region/components/PollSection'
import { useRegionPollQuery } from '@/features/region/useRegionPollQuery'

const TARGET: PollTarget = { kind: 'regions', id: '51820', month: '2025-10', preset: 'quiet' }

function Harness() {
  const poll = useRegionPollQuery('51820', '2025-10', 'quiet')
  return (
    <PollSection
      question="조용했나요?"
      data={poll.data}
      status={poll.status}
      onRetry={() => {}}
      participationLabel="지표 검증에 반영돼요"
      target={TARGET}
    />
  )
}

const yesButton = () => screen.findByRole('button', { name: /그래요/ })
const noButton = () => screen.findByRole('button', { name: /아니요/ })

describe('PollSection 체감 투표', () => {
  beforeEach(() => {
    loggedIn = true
    failVote = false
    server = BASE
    openLogin.mockReset()
    show.mockReset()
    votePoll.mockReset()
  })

  it('누르면 투표·선택 표시, 다시 누르면 취소, 반대쪽은 변경', async () => {
    const user = userEvent.setup()
    renderWithRouter(<Harness />)
    expect(await yesButton()).toHaveAttribute('aria-pressed', 'false')
    expect(await yesButton()).toHaveTextContent('그래요 75%')

    await user.click(await yesButton())
    expect(await yesButton()).toHaveAttribute('aria-pressed', 'true')
    expect(await yesButton()).toHaveTextContent('그래요 80%') // 4/5
    expect(screen.getByText(/5명 참여/)).toBeInTheDocument()
    expect(votePoll).toHaveBeenLastCalledWith(TARGET, 'yes')

    await user.click(await noButton())
    await waitFor(() => expect(votePoll).toHaveBeenLastCalledWith(TARGET, 'no'))
    expect(await noButton()).toHaveAttribute('aria-pressed', 'true')
    expect(await yesButton()).toHaveAttribute('aria-pressed', 'false')
    expect(await yesButton()).toHaveTextContent('그래요 60%') // 3/5

    await user.click(await noButton())
    await waitFor(() => expect(votePoll).toHaveBeenLastCalledWith(TARGET, null))
    expect(await noButton()).toHaveAttribute('aria-pressed', 'false')
    expect(await yesButton()).toHaveTextContent('그래요 75%')
    expect(screen.getByText(/4명 참여/)).toBeInTheDocument()
  })

  it('실패하면 롤백하고 토스트를 띄운다', async () => {
    failVote = true
    const user = userEvent.setup()
    renderWithRouter(<Harness />)
    await user.click(await yesButton())
    await waitFor(() => expect(show).toHaveBeenCalledWith(expect.stringContaining('투표')))
    expect(await yesButton()).toHaveAttribute('aria-pressed', 'false')
    expect(await yesButton()).toHaveTextContent('그래요 75%')
  })

  it('비로그인이면 로그인 모달만 열고 투표하지 않는다', async () => {
    loggedIn = false
    const user = userEvent.setup()
    renderWithRouter(<Harness />)
    await user.click(await yesButton())
    expect(openLogin).toHaveBeenCalled()
    expect(votePoll).not.toHaveBeenCalled()
  })
})

describe('PollSection 이달의 사진 올리기', () => {
  it('사진을 고르면 미리보기, 제출하면 그 달로 올리고 바로 게시 토스트', async () => {
    loggedIn = true
    show.mockReset()
    uploadMonthPhotos.mockReset().mockResolvedValue({ items: [] })
    globalThis.URL.createObjectURL ??= () => 'blob:preview'
    globalThis.URL.revokeObjectURL ??= () => {}
    const user = userEvent.setup()
    renderWithRouter(
      <PollSection
        question="조용했나요?"
        data={BASE}
        status="success"
        onRetry={() => {}}
        participationLabel="지표 검증에 반영돼요"
        photoCaption="10월 · 사용자 제공"
        target={TARGET}
      />,
    )
    await user.click(screen.getByRole('button', { name: /이달의 사진 올리기/ }))
    const submit = screen.getByRole('button', { name: '제출' })
    expect(submit).toBeDisabled()
    expect(screen.getByText(/올리면 바로 게시돼요/)).toBeInTheDocument()

    const file = new File(['x'], 'sea.jpg', { type: 'image/jpeg' })
    await user.upload(screen.getByTestId('photo-input'), file)
    expect(screen.getByRole('img', { name: 'sea.jpg' })).toBeInTheDocument()

    await user.click(submit)
    expect(uploadMonthPhotos).toHaveBeenCalledWith(
      { kind: 'regions', id: '51820', month: '2025-10' },
      [file],
    )
    await waitFor(() => expect(show).toHaveBeenCalledWith('사진을 올렸어요'))
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('올리기에 실패하면 모달을 닫지 않고 실패 토스트', async () => {
    loggedIn = true
    show.mockReset()
    uploadMonthPhotos.mockReset().mockRejectedValue(new Error('API 400'))
    globalThis.URL.createObjectURL ??= () => 'blob:preview'
    globalThis.URL.revokeObjectURL ??= () => {}
    const user = userEvent.setup()
    renderWithRouter(
      <PollSection
        question="조용했나요?"
        data={BASE}
        status="success"
        onRetry={() => {}}
        participationLabel="지표 검증에 반영돼요"
        photoCaption="10월 · 사용자 제공"
        target={TARGET}
      />,
    )
    await user.click(screen.getByRole('button', { name: /이달의 사진 올리기/ }))
    await user.upload(
      screen.getByTestId('photo-input'),
      new File(['x'], 'a.jpg', { type: 'image/jpeg' }),
    )
    await user.click(screen.getByRole('button', { name: '제출' }))
    await waitFor(() =>
      expect(show).toHaveBeenCalledWith(expect.stringContaining('올리지 못했어요')),
    )
    expect(screen.getByRole('dialog')).toBeInTheDocument()
  })
})
