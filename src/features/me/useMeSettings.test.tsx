import { beforeEach, describe, expect, it, vi } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import renderWithRouter from '@/test/renderWithRouter'

const show = vi.fn()
vi.mock('@/features/auth/useAuth', () => ({
  useAuth: () => ({ me: { id: 'u1' }, isPending: false, isLoggedIn: true }),
}))
vi.mock('@/components/ui/toast/useToast', () => ({ useToast: () => ({ show }) }))
const patchMeSettings = vi.fn()
vi.mock('@/features/me/api', () => ({
  getMeSettings: () =>
    Promise.resolve({ notifyBestMonth: true, notifyTipReaction: true, notifyPhotoSelected: false }),
  patchMeSettings: (...a: unknown[]) => patchMeSettings(...a),
}))

import { useMeSettings, useUpdateSettings } from '@/features/me/useMeSettings'

function Probe() {
  const { data } = useMeSettings()
  const update = useUpdateSettings()
  if (!data) return <p>loading</p>
  return (
    <div>
      <output data-testid="photo">{String(data.notifyPhotoSelected)}</output>
      <button onClick={() => update.mutate({ notifyPhotoSelected: !data.notifyPhotoSelected })}>
        flip
      </button>
    </div>
  )
}

describe('useUpdateSettings', () => {
  beforeEach(() => {
    show.mockReset()
    patchMeSettings.mockReset()
  })

  it('낙관적으로 바꾸고 PATCH 호출', async () => {
    patchMeSettings.mockResolvedValue({
      notifyBestMonth: true,
      notifyTipReaction: true,
      notifyPhotoSelected: true,
    })
    renderWithRouter(<Probe />)
    await screen.findByTestId('photo')
    await userEvent.click(screen.getByText('flip'))
    expect(screen.getByTestId('photo')).toHaveTextContent('true')
    expect(patchMeSettings).toHaveBeenCalledWith({ notifyPhotoSelected: true })
  })

  it('실패하면 롤백 + 토스트', async () => {
    patchMeSettings.mockRejectedValue(new Error('500'))
    renderWithRouter(<Probe />)
    await screen.findByTestId('photo')
    await userEvent.click(screen.getByText('flip'))
    await waitFor(() => expect(screen.getByTestId('photo')).toHaveTextContent('false'))
    expect(show).toHaveBeenCalledWith('설정을 저장하지 못했어요')
  })
})
