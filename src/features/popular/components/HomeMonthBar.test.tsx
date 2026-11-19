import { describe, expect, it } from 'vitest'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import renderWithRouter from '@/test/renderWithRouter'
import HomeMonthBar from '@/features/popular/components/HomeMonthBar'

describe('HomeMonthBar', () => {
  it('URL 의 월을 버튼에 보인다', () => {
    renderWithRouter(<HomeMonthBar />, { route: '/?month=2025-10' })
    expect(screen.getByRole('button', { name: '월 선택: 10월' })).toBeInTheDocument()
  })

  it('휠에서 다른 달을 고르면 URL month 가 바뀌고 다른 쿼리는 유지된다', async () => {
    renderWithRouter(<HomeMonthBar />, { route: '/?month=2025-10&scope=dong' })
    await userEvent.click(screen.getByRole('button', { name: '월 선택: 10월' }))
    await userEvent.click(screen.getByRole('option', { name: '3월' }))
    await userEvent.click(screen.getByRole('button', { name: '선택 완료' }))
    const location = screen.getByTestId('location')
    expect(location).toHaveTextContent('month=2025-03')
    expect(location).toHaveTextContent('scope=dong')
    expect(screen.getByRole('button', { name: '월 선택: 3월' })).toBeInTheDocument()
  })

  it('연간을 고를 수 있다', async () => {
    renderWithRouter(<HomeMonthBar />, { route: '/' })
    await userEvent.click(screen.getByRole('button', { name: /월 선택/ }))
    await userEvent.click(screen.getByRole('option', { name: '연간' }))
    await userEvent.click(screen.getByRole('button', { name: '선택 완료' }))
    expect(screen.getByTestId('location')).toHaveTextContent('month=annual')
  })
})
