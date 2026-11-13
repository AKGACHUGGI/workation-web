import { describe, expect, it } from 'vitest'
import { render } from '@testing-library/react'
import Block from '@/features/explore/components/Skeleton'

describe('Skeleton Block', () => {
  it('기본: 패널 회색 + 반짝임 + 작은 모서리, 스크린 리더에서 숨김', () => {
    const { container } = render(<Block className="h-3 w-30" />)
    const el = container.querySelector('[data-skeleton]')!
    expect(el).toHaveAttribute('aria-hidden', 'true')
    expect(el).toHaveClass(
      'bg-explore-skeleton-base',
      'skeleton-shine',
      'rounded-sm',
      'h-3',
      'w-30',
    )
  })
  it('지도 위(tone=map)는 더 진한 회색, shape 로 모서리를 바꾼다', () => {
    const { container } = render(<Block tone="map" shape="pill" />)
    const el = container.querySelector('[data-skeleton]')!
    expect(el).toHaveClass('bg-explore-skeleton-map', 'rounded-full')
    expect(el).not.toHaveClass('rounded-sm')
  })
})
