import { afterEach, describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import ThemeToggle from '@/components/layout/ThemeToggle'

afterEach(() => {
  localStorage.clear()
  delete document.documentElement.dataset.theme
})

describe('ThemeToggle', () => {
  it('라이트면 달 아이콘·다크로 전환 라벨, 누르면 해 아이콘·라이트로 전환 라벨', async () => {
    render(<ThemeToggle />)
    const button = screen.getByRole('button', { name: '다크 모드로 전환' })
    expect(button.querySelector('[data-icon="moon"]')).not.toBeNull()
    await userEvent.click(button)
    const next = screen.getByRole('button', { name: '라이트 모드로 전환' })
    expect(next.querySelector('[data-icon="sun"]')).not.toBeNull()
    expect(document.documentElement.dataset.theme).toBe('dark')
  })
  it('처음 그릴 때는 아이콘이 돌지 않고, 누른 뒤에만 돈다', async () => {
    render(<ThemeToggle />)
    expect(screen.getByRole('button').querySelector('svg')).not.toHaveClass('animate-theme-icon')
    await userEvent.click(screen.getByRole('button'))
    expect(screen.getByRole('button').querySelector('svg')).toHaveClass('animate-theme-icon')
  })
})
