import { describe, expect, it } from 'vitest'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import renderWithRouter from '@/test/renderWithRouter'
import CategoryStrip from '@/features/popular/components/CategoryStrip'

describe('CategoryStrip', () => {
  it('해안 클릭 → terrain=coast, 다시 클릭 → 해제', async () => {
    renderWithRouter(<CategoryStrip />, { route: '/' })
    await userEvent.click(screen.getByRole('button', { name: '해안' }))
    expect(screen.getByTestId('location')).toHaveTextContent('terrain=coast')
    expect(screen.getByRole('button', { name: '해안' })).toHaveAttribute('aria-pressed', 'true')
    await userEvent.click(screen.getByRole('button', { name: '해안' }))
    expect(screen.getByTestId('location')).not.toHaveTextContent('terrain=')
  })
  it('복수 지형 선택', async () => {
    renderWithRouter(<CategoryStrip />, { route: '/?terrain=coast' })
    await userEvent.click(screen.getByRole('button', { name: '도시' }))
    expect(screen.getByTestId('location')).toHaveTextContent('terrain=coast%2Ccity')
  })
  it('조용한 곳 → preset=quiet, 또래 → preset=lively', async () => {
    renderWithRouter(<CategoryStrip />, { route: '/' })
    await userEvent.click(screen.getByRole('button', { name: '또래' }))
    expect(screen.getByTestId('location')).toHaveTextContent('preset=lively')
    expect(screen.getByRole('button', { name: '또래' })).toHaveAttribute('aria-pressed', 'true')
    await userEvent.click(screen.getByRole('button', { name: '조용한 곳' }))
    expect(screen.getByTestId('location')).toHaveTextContent('preset=quiet')
  })
  it('한 달 살기·워케이션은 장식 (aria-disabled)', () => {
    renderWithRouter(<CategoryStrip />)
    expect(screen.getByRole('button', { name: '한 달 살기' })).toHaveAttribute(
      'aria-disabled',
      'true',
    )
  })
})
