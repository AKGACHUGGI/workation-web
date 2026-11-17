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
  it('장소 태그는 place 쿼리로 토글', async () => {
    renderWithRouter(<CategoryStrip />, { route: '/?terrain=coast' })
    await userEvent.click(screen.getByRole('button', { name: '카페 많음' }))
    await userEvent.click(screen.getByRole('button', { name: '해수욕장' }))
    expect(screen.getByTestId('location')).toHaveTextContent('place=beach%2Ccafe')
    expect(screen.getByTestId('location')).toHaveTextContent('terrain=coast')
    await userEvent.click(screen.getByRole('button', { name: '카페 많음' }))
    expect(screen.getByTestId('location')).toHaveTextContent('place=beach')
    expect(screen.getByTestId('location')).not.toHaveTextContent('cafe')
  })
  it('분위기(프리셋) 탭은 없다', () => {
    renderWithRouter(<CategoryStrip />)
    expect(screen.queryByRole('button', { name: '조용한 곳' })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: '또래' })).not.toBeInTheDocument()
  })
})
