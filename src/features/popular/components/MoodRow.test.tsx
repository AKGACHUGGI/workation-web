import { describe, expect, it } from 'vitest'
import { screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import renderWithRouter from '@/test/renderWithRouter'
import MoodRow from '@/features/popular/components/MoodRow'

describe('MoodRow', () => {
  it('기본은 조용한 곳 선택', () => {
    renderWithRouter(<MoodRow />)
    expect(screen.getByRole('button', { name: '조용한 곳' })).toHaveAttribute(
      'aria-pressed',
      'true',
    )
  })
  it('고르면 preset 과 함께 정렬이 종합 점수순으로', async () => {
    renderWithRouter(<MoodRow />, { route: '/?terrain=coast' })
    await userEvent.click(screen.getByRole('button', { name: '활기 있는 한 달' }))
    const loc = screen.getByTestId('location')
    expect(loc).toHaveTextContent('preset=lively')
    expect(loc).toHaveTextContent('sort=score')
    expect(loc).toHaveTextContent('terrain=coast')
    expect(screen.getByRole('button', { name: '활기 있는 한 달' })).toHaveAttribute(
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
