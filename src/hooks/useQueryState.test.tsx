import { describe, expect, it } from 'vitest'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import renderWithRouter from '@/test/renderWithRouter'
import { useQueryState } from '@/hooks/useQueryState'
import { parseMonth, DEFAULT_MONTH } from '@/features/metric/month'

function MonthProbe() {
  const [month, setMonth] = useQueryState('month', parseMonth, DEFAULT_MONTH)
  return (
    <div>
      <output data-testid="month">{month}</output>
      <button onClick={() => setMonth('2025-03')}>push</button>
      <button onClick={() => setMonth('2025-04', { replace: true })}>replace</button>
    </div>
  )
}

describe('useQueryState', () => {
  it('쿼리가 없으면 기본값, URL 은 건드리지 않는다', () => {
    renderWithRouter(<MonthProbe />, { route: '/' })
    expect(screen.getByTestId('month')).toHaveTextContent('2025-12')
    expect(screen.getByTestId('location')).toHaveTextContent('/')
  })

  it('유효한 쿼리를 읽는다', () => {
    renderWithRouter(<MonthProbe />, { route: '/?month=2025-10' })
    expect(screen.getByTestId('month')).toHaveTextContent('2025-10')
  })

  it('잘못된 값은 기본값으로 바꾸고 URL 을 replace 로 고친다', async () => {
    renderWithRouter(<MonthProbe />, { route: '/?month=2099-01&preset=quiet' })
    expect(screen.getByTestId('month')).toHaveTextContent('2025-12')
    expect(await screen.findByText('/?month=2025-12&preset=quiet')).toBeInTheDocument()
  })

  it('setter 는 다른 쿼리를 유지한 채 값을 바꾼다', async () => {
    renderWithRouter(<MonthProbe />, { route: '/?preset=lively' })
    await userEvent.click(screen.getByText('push'))
    expect(screen.getByTestId('location')).toHaveTextContent('/?preset=lively&month=2025-03')
    expect(screen.getByTestId('month')).toHaveTextContent('2025-03')
  })
})
