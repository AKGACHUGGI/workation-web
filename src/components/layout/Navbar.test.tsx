import { describe, expect, it } from 'vitest'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import renderWithRouter from '@/test/renderWithRouter'
import Navbar from '@/components/layout/Navbar'

describe('Navbar (Figma Web/NavbarV2)', () => {
  it('메뉴 링크가 month·preset 쿼리를 유지한다', () => {
    renderWithRouter(<Navbar />, { route: '/?month=2025-10&preset=lively' })
    expect(screen.getByRole('link', { name: '시기 보기' })).toHaveAttribute(
      'href',
      '/tier?month=2025-10&preset=lively',
    )
    expect(screen.getByRole('link', { name: '동네 고르기' })).toHaveAttribute(
      'href',
      '/compare?month=2025-10&preset=lively',
    )
  })
  it('현재 경로의 메뉴가 aria-current=page', () => {
    renderWithRouter(<Navbar />, { route: '/tier' })
    expect(screen.getByRole('link', { name: '시기 보기' })).toHaveAttribute('aria-current', 'page')
    expect(screen.getByRole('link', { name: '지역 찾기' })).not.toHaveAttribute('aria-current')
  })
  it('워케이션 노트 탭은 보이지만 비활성이고 눌러도 이동하지 않는다', async () => {
    renderWithRouter(<Navbar />, { route: '/tier' })
    const note = screen.getByRole('link', { name: /워케이션 노트/ })
    expect(note).toHaveAttribute('aria-disabled', 'true')
    expect(note).not.toHaveAttribute('href')
    await userEvent.click(note)
    expect(screen.getByTestId('location')).toHaveTextContent('/tier')
  })
  it('팁 남기기·언어 버튼과 로그인(계정 필) 버튼이 있다', () => {
    renderWithRouter(<Navbar />)
    expect(screen.getByRole('button', { name: '팁 남기기' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '언어' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '로그인' })).toBeInTheDocument()
  })
})
