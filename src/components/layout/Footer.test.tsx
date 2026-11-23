import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import Footer from '@/components/layout/Footer'

describe('Footer (Figma 274:4885)', () => {
  it('3단 링크 없이 하단 바만', () => {
    render(<Footer />)
    expect(screen.queryByRole('navigation')).not.toBeInTheDocument()
    expect(screen.queryByText('이용 가이드')).not.toBeInTheDocument()
    expect(screen.getByText(/© 2026 팀 아카츠키/)).toBeInTheDocument()
    expect(screen.getByText('한국어 (KR)')).toBeInTheDocument()
    expect(screen.getByText('₩ KRW')).toBeInTheDocument()
  })
})
