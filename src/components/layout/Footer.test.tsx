import { describe, expect, it } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import Footer from '@/components/layout/Footer'

describe('Footer (Figma 274:4885)', () => {
  it('3단 링크와 하단 바', () => {
    render(<Footer />)
    for (const title of ['지원', '데이터', '워케이션맵']) {
      const col = screen.getByRole('navigation', { name: title })
      expect(within(col).getByRole('heading', { name: title })).toBeInTheDocument()
      expect(within(col).getAllByRole('link')).toHaveLength(4)
    }
    expect(screen.getByRole('link', { name: '이용 가이드' })).toHaveAttribute('href', '#')
    expect(screen.getByText(/© 2026 팀 아카츠키/)).toBeInTheDocument()
    expect(screen.getByText('한국어 (KR)')).toBeInTheDocument()
    expect(screen.getByText('₩ KRW')).toBeInTheDocument()
  })
})
