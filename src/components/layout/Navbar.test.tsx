import { describe, expect, it } from 'vitest'
import { screen } from '@testing-library/react'
import renderWithRouter from '@/test/renderWithRouter'
import Navbar from '@/components/layout/Navbar'

describe('Navbar', () => {
  it('메뉴 링크가 month·preset 쿼리를 유지한다', () => {
    renderWithRouter(<Navbar />, { route: '/?month=2025-10&preset=lively' })
    expect(screen.getByRole('link', { name: '티어리스트' })).toHaveAttribute(
      'href',
      '/tier?month=2025-10&preset=lively',
    )
    expect(screen.getByRole('link', { name: '동네 비교' })).toHaveAttribute(
      'href',
      '/compare?month=2025-10&preset=lively',
    )
  })
  it('현재 경로의 메뉴가 aria-current=page', () => {
    renderWithRouter(<Navbar />, { route: '/tier' })
    expect(screen.getByRole('link', { name: '티어리스트' })).toHaveAttribute('aria-current', 'page')
    expect(screen.getByRole('link', { name: '탐색' })).not.toHaveAttribute('aria-current')
  })
  it('로그인 버튼이 있다', () => {
    renderWithRouter(<Navbar />)
    expect(screen.getByRole('button', { name: '로그인' })).toBeInTheDocument()
  })
})
