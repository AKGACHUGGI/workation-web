import { describe, expect, it, vi } from 'vitest'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import renderWithRouter from '@/test/renderWithRouter'

const mutate = vi.fn()
vi.mock('@/features/me/useMeSettings', () => ({
  useMeSettings: () => ({
    data: { notifyBestMonth: true, notifyTipReaction: true, notifyPhotoSelected: false },
    isPending: false,
  }),
  useUpdateSettings: () => ({ mutate, isPending: false }),
}))

import NotificationSettings from '@/features/me/components/NotificationSettings'

describe('NotificationSettings', () => {
  it('토글 3개, 클릭 시 해당 키만 PATCH', async () => {
    renderWithRouter(<NotificationSettings />)
    expect(screen.getAllByRole('switch')).toHaveLength(3)
    await userEvent.click(screen.getByRole('switch', { name: '이달의 사진 선정 알림' }))
    expect(mutate).toHaveBeenCalledWith({ notifyPhotoSelected: true })
  })
})
