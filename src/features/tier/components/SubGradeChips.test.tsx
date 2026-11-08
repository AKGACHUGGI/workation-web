import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import SubGradeChips from '@/features/tier/components/SubGradeChips'

const goseong = { quiet: 55, crowd: 37, peer: 48, overnight: 76, vibe: 30 }

describe('SubGradeChips', () => {
  it('조용·시기·또래·숙박·활기 순서로 metricGrade 를 보여준다', () => {
    const { container } = render(<SubGradeChips scores={goseong} />)
    const chips = [...container.querySelectorAll('[data-metric]')]
    expect(chips.map((c) => c.getAttribute('data-metric'))).toEqual([
      'quiet',
      'crowd',
      'peer',
      'overnight',
      'vibe',
    ])
    expect(screen.getAllByLabelText(/^등급 /).map((b) => b.textContent)).toEqual([
      'A',
      'B',
      'B',
      'S',
      'B',
    ])
  })

  it('selected 에 없는 지표는 흐리게', () => {
    const { container } = render(
      <SubGradeChips scores={goseong} selected={['quiet', 'crowd', 'overnight']} />,
    )
    const dim = [...container.querySelectorAll('[data-dim="true"]')].map((c) =>
      c.getAttribute('data-metric'),
    )
    expect(dim).toEqual(['peer', 'vibe'])
  })

  it('inherited 지표는 툴팁 "시군구 산출값" 과 연결된다', () => {
    const { container } = render(<SubGradeChips scores={goseong} inherited={['overnight']} />)
    const overnight = container.querySelector('[data-metric="overnight"]')!
    expect(overnight).toHaveAttribute('aria-describedby')
    expect(container.querySelector('[data-metric="quiet"]')).not.toHaveAttribute('aria-describedby')
  })
})
