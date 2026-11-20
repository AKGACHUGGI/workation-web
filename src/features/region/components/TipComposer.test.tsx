import { beforeEach, describe, expect, it, vi } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { createNote } from '@/features/region/api'
import TipComposer from '@/features/region/components/TipComposer'
import { regionKeys } from '@/features/region/queryKeys'
import type { Note, NotesResponse } from '@/features/region/types'
import { DUI } from '@/mocks/auth/me'
import renderWithAuth from '@/test/renderWithAuth'

vi.mock('@/features/region/api', () => ({ createNote: vi.fn() }))

const ME = { ...DUI, needsOnboarding: false }
const TARGET = { kind: 'regions', id: '46150' } as const
const NOTE: Note = {
  id: '9',
  author: { nickname: '두이', initial: '두' },
  createdAt: '2025-10-01T00:00:00Z',
  body: '조용해요',
  helpful: 0,
  replies: 0,
}

const renderComposer = (me: typeof ME | null = ME) =>
  renderWithAuth(<TipComposer placeholder="팁을 남겨보세요" target={TARGET} />, { me })

describe('TipComposer', () => {
  // 중괄호 필수: mock 을 반환하면 vitest 가 정리 함수로 여겨 호출한다
  beforeEach(() => {
    vi.mocked(createNote).mockReset()
  })

  it('본문이 비면 등록 비활성, 입력하면 활성', async () => {
    renderComposer()
    const submit = screen.getByRole('button', { name: '등록' })
    expect(submit).toBeDisabled()
    await userEvent.type(screen.getByRole('textbox', { name: '워케이션 팁' }), '   ')
    expect(submit).toBeDisabled()
    await userEvent.type(screen.getByRole('textbox', { name: '워케이션 팁' }), '조용해요')
    expect(submit).toBeEnabled()
  })

  it('등록: 앞뒤 공백을 자른 본문으로 POST, 성공하면 비우고 목록 캐시 맨 앞에 넣고 토스트', async () => {
    vi.mocked(createNote).mockResolvedValue(NOTE)
    const { client } = renderComposer()
    const key = regionKeys.notes('46150', { sort: 'helpful' })
    client.setQueryData<NotesResponse>(key, { total: 1, items: [{ ...NOTE, id: '1' }] })
    const input = screen.getByRole('textbox', { name: '워케이션 팁' })
    await userEvent.type(input, '  조용해요  ')
    await userEvent.click(screen.getByRole('button', { name: '등록' }))
    expect(createNote).toHaveBeenCalledWith(TARGET, { body: '조용해요' })
    await waitFor(() => expect(input).toHaveValue(''))
    expect(screen.getByRole('status')).toHaveTextContent('팁을 남겼어요')
    const cached = client.getQueryData<NotesResponse>(key)
    expect(cached?.total).toBe(2)
    expect(cached?.items.map((n) => n.id)).toEqual(['9', '1'])
  })

  it('Cmd/Ctrl+Enter 로 등록', async () => {
    vi.mocked(createNote).mockResolvedValue(NOTE)
    renderComposer()
    await userEvent.type(screen.getByRole('textbox', { name: '워케이션 팁' }), '조용해요')
    await userEvent.keyboard('{Control>}{Enter}{/Control}')
    expect(createNote).toHaveBeenCalledTimes(1)
  })

  it('실패: 토스트, 입력 유지', async () => {
    vi.mocked(createNote).mockRejectedValue(new Error('API 429'))
    renderComposer()
    const input = screen.getByRole('textbox', { name: '워케이션 팁' })
    await userEvent.type(input, '조용해요')
    await userEvent.click(screen.getByRole('button', { name: '등록' }))
    await waitFor(() =>
      expect(screen.getByRole('status')).toHaveTextContent('팁을 올리지 못했어요'),
    )
    expect(input).toHaveValue('조용해요')
  })

  it('비로그인: 입력에 포커스하면 로그인 모달, 입력 불가', async () => {
    renderComposer(null)
    const input = screen.getByRole('textbox', { name: '워케이션 팁' })
    await userEvent.click(input)
    expect(screen.getByRole('dialog', { name: '당신의 장소를 찾으세요' })).toBeInTheDocument()
    expect(input).toHaveAttribute('readonly')
  })

  it('사진 선택 → 썸네일, X 로 삭제', async () => {
    URL.createObjectURL = vi.fn(() => 'blob:preview')
    URL.revokeObjectURL = vi.fn()
    const { container } = renderComposer()
    const file = new File(['x'], 'a.png', { type: 'image/png' })
    await userEvent.upload(container.querySelector<HTMLInputElement>('input[type=file]')!, file)
    expect(screen.getByRole('img', { name: '첨부 사진 1' })).toBeInTheDocument()
    await userEvent.click(screen.getByRole('button', { name: '첨부 사진 1 삭제' }))
    expect(screen.queryByRole('img', { name: '첨부 사진 1' })).not.toBeInTheDocument()
  })

  it('사진을 붙이면 본문과 함께 파일을 보낸다', async () => {
    URL.createObjectURL = vi.fn(() => 'blob:preview')
    URL.revokeObjectURL = vi.fn()
    vi.mocked(createNote).mockResolvedValue(NOTE)
    const { container } = renderComposer()
    const file = new File(['x'], 'a.png', { type: 'image/png' })
    await userEvent.upload(container.querySelector<HTMLInputElement>('input[type=file]')!, file)
    await userEvent.type(screen.getByRole('textbox', { name: '워케이션 팁' }), '바다 사진')
    await userEvent.click(screen.getByRole('button', { name: '등록' }))
    expect(createNote).toHaveBeenCalledWith(TARGET, { body: '바다 사진', photos: [file] })
    await waitFor(() =>
      expect(screen.queryByRole('img', { name: '첨부 사진 1' })).not.toBeInTheDocument(),
    )
  })

  it('방문 월을 고르면 함께 보내고, 등록 후 비운다', async () => {
    vi.mocked(createNote).mockResolvedValue(NOTE)
    renderComposer()
    const month = screen.getByRole('combobox', { name: '방문 월' })
    await userEvent.selectOptions(month, '2025-12')
    await userEvent.type(screen.getByRole('textbox', { name: '워케이션 팁' }), '조용해요')
    await userEvent.click(screen.getByRole('button', { name: '등록' }))
    expect(createNote).toHaveBeenCalledWith(TARGET, { body: '조용해요', visitMonth: '2025-12' })
    await waitFor(() => expect(month).toHaveValue(''))
  })
})
