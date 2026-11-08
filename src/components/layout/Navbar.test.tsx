import { describe, expect, it } from 'vitest'
import { screen, within } from '@testing-library/react'
import renderWithRouter from '@/test/renderWithRouter'
import Navbar from '@/components/layout/Navbar'

describe('Navbar (Figma Web/NavbarV2)', () => {
  it('메뉴 링크가 month·preset 쿼리를 유지한다', () => {
    renderWithRouter(<Navbar />, { route: '/?month=2025-10&preset=lively' })
    expect(screen.getByRole('link', { name: '랭킹' })).toHaveAttribute(
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
    expect(screen.getByRole('link', { name: '랭킹' })).toHaveAttribute('aria-current', 'page')
    expect(screen.getByRole('link', { name: '지역 찾기' })).not.toHaveAttribute('aria-current')
  })
  it('제품 탭은 지역 찾기·랭킹·동네 고르기 3개이고 워케이션 노트 탭은 없다', () => {
    renderWithRouter(<Navbar />, { route: '/tier' })
    const nav = screen.getByRole('navigation', { name: '주 메뉴' })
    const tabs = within(nav).getAllByRole('link')
    expect(tabs.map((t) => t.textContent)).toEqual(['지역 찾기', '랭킹', '동네 고르기'])
    expect(screen.queryByRole('link', { name: /워케이션 노트/ })).not.toBeInTheDocument()
    expect(screen.queryByText('NEW')).not.toBeInTheDocument()
  })
  it('팁 남기기·언어 버튼과 로그인(계정 필) 버튼이 있다', () => {
    renderWithRouter(<Navbar />)
    expect(screen.getByRole('button', { name: '팁 남기기' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '언어' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '로그인' })).toBeInTheDocument()
  })
})
