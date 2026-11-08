import { describe, expect, it } from 'vitest'
import { screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import renderWithRouter from '@/test/renderWithRouter'
import HomeMonthBar from '@/features/popular/components/HomeMonthBar'

describe('HomeMonthBar', () => {
  it('연간과 1월~12월 칩 13개를 그리고 URL 의 월을 선택 표시한다', () => {
    renderWithRouter(<HomeMonthBar />, { route: '/?month=2025-10' })
    const group = screen.getByRole('group', { name: '월' })
    expect(within(group).getAllByRole('button')).toHaveLength(13)
    expect(within(group).getByRole('button', { name: '10월' })).toHaveAttribute(
      'aria-pressed',
      'true',
    )
  })

  it('다른 달을 누르면 URL month 가 바뀌고 다른 쿼리는 유지된다', async () => {
    renderWithRouter(<HomeMonthBar />, { route: '/?month=2025-10&scope=dong' })
    await userEvent.click(screen.getByRole('button', { name: '3월' }))
    const location = screen.getByTestId('location')
    expect(location).toHaveTextContent('month=2025-03')
    expect(location).toHaveTextContent('scope=dong')
    expect(screen.getByRole('button', { name: '3월' })).toHaveAttribute('aria-pressed', 'true')
  })

  it('연간을 고를 수 있다', async () => {
    renderWithRouter(<HomeMonthBar />, { route: '/' })
    await userEvent.click(screen.getByRole('button', { name: '연간' }))
    expect(screen.getByTestId('location')).toHaveTextContent('month=annual')
  })
})
