import { describe, expect, it } from 'vitest'
import { screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import renderWithRouter from '@/test/renderWithRouter'
import MoodRow from '@/features/popular/components/MoodRow'

describe('MoodRow', () => {
  it('기본은 아무것도 선택 안 됨', () => {
    renderWithRouter(<MoodRow />)
    for (const name of ['조용한 곳', '활기 있는 곳', '직접 설정']) {
      expect(screen.getByRole('button', { name })).toHaveAttribute('aria-pressed', 'false')
    }
  })
  it('고른 칩을 다시 누르면 해제 (preset · metrics 삭제)', async () => {
    renderWithRouter(<MoodRow />, { route: '/?preset=custom&metrics=quiet&terrain=coast' })
    await userEvent.click(screen.getByRole('button', { name: '직접 설정' }))
    const loc = screen.getByTestId('location')
    expect(loc).not.toHaveTextContent('preset=')
    expect(loc).not.toHaveTextContent('metrics=')
    expect(loc).toHaveTextContent('terrain=coast')
    expect(screen.queryByRole('group', { name: '포함 지표' })).not.toBeInTheDocument()
  })
  it('고르면 preset 과 함께 정렬이 종합 점수순으로', async () => {
    renderWithRouter(<MoodRow />, { route: '/?terrain=coast' })
    await userEvent.click(screen.getByRole('button', { name: '활기 있는 곳' }))
    const loc = screen.getByTestId('location')
    expect(loc).toHaveTextContent('preset=lively')
    expect(loc).toHaveTextContent('sort=score')
    expect(loc).toHaveTextContent('terrain=coast')
    expect(screen.getByRole('button', { name: '활기 있는 곳' })).toHaveAttribute(
      'aria-pressed',
      'true',
    )
  })
  it('직접 설정이면 지표 토글이 펼쳐진다', () => {
    renderWithRouter(<MoodRow />, { route: '/?preset=custom&metrics=quiet,crowd' })
    const toggles = screen.getByRole('group', { name: '포함 지표' })
    expect(within(toggles).getByRole('button', { name: '동네 조용함' })).toHaveAttribute(
      'aria-pressed',
      'true',
    )
  })
})
