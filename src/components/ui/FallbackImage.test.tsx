import { describe, expect, it } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/react'
import FallbackImage from '@/components/ui/FallbackImage'

describe('FallbackImage', () => {
  it('정상일 때는 img', () => {
    render(<FallbackImage src="/a.jpg" alt="고성군 1" className="aspect-4/3 w-full" />)
    expect(screen.getByRole('img', { name: '고성군 1' }).tagName).toBe('IMG')
  })
  it('로드 실패 시 같은 클래스의 회색 박스로 바뀌고 이름은 유지', () => {
    render(<FallbackImage src="/missing.jpg" alt="고성군 1" className="aspect-4/3 w-full" />)
    fireEvent.error(screen.getByRole('img', { name: '고성군 1' }))
    const box = screen.getByRole('img', { name: '고성군 1' })
    expect(box.tagName).toBe('SPAN')
    expect(box).toHaveClass('bg-bg-subtle', 'aspect-4/3', 'w-full')
  })
})
