import { describe, expect, it, vi } from 'vitest'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import renderWithRouter from '@/test/renderWithRouter'
import ListingCard from '@/components/ui/ListingCard'

const base = {
  photoUrl: '/mock-photos/51820.jpg',
  title: '고성군, 강원특별자치도',
  score: 50,
  scoreGrade: 'S' as const,
  meta1: '해안 · 속초시 인접',
  meta2: '즐겨찾기 1,284 · 조회 8.2천 · 10월',
  chips: [
    { label: '조용', grade: 'A' as const },
    { label: '또래', grade: 'B' as const },
    { label: '숙박', grade: 'S' as const },
  ],
  href: '/regions/51820?month=2025-10',
}

describe('ListingCard', () => {
  it('제목·점수·메타·칩·배지를 렌더하고 카드가 링크다', () => {
    renderWithRouter(
      <ListingCard {...base} badge="즐겨찾기 1위" favorite={false} onToggleFavorite={() => {}} />,
    )
    expect(screen.getByRole('link', { name: /고성군, 강원특별자치도/ })).toHaveAttribute(
      'href',
      '/regions/51820?month=2025-10',
    )
    expect(screen.getByText('50')).toBeInTheDocument()
    expect(screen.getByText('즐겨찾기 1위')).toBeInTheDocument()
    expect(screen.getByText('해안 · 속초시 인접')).toBeInTheDocument()
    expect(screen.getByText('조용')).toBeInTheDocument()
    expect(screen.getByLabelText('등급 A')).toBeInTheDocument()
  })

  it('하트는 aria-pressed 이고 클릭해도 링크 이동 없이 onToggleFavorite 만 부른다', async () => {
    const onToggle = vi.fn()
    renderWithRouter(<ListingCard {...base} favorite onToggleFavorite={onToggle} />, { route: '/' })
    const heart = screen.getByRole('button', { name: '즐겨찾기' })
    expect(heart).toHaveAttribute('aria-pressed', 'true')
    await userEvent.click(heart)
    expect(onToggle).toHaveBeenCalledTimes(1)
    expect(screen.getByTestId('location')).toHaveTextContent('/')
  })
})
