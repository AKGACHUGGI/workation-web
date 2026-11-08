import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import Tooltip from '@/components/ui/Tooltip'

describe('Tooltip', () => {
  it('호버하면 보이고 aria-describedby 로 연결된다', async () => {
    render(
      <Tooltip content="시군구 산출값">
        <span tabIndex={0}>숙박</span>
      </Tooltip>,
    )
    const trigger = screen.getByText('숙박')
    expect(screen.queryByRole('tooltip')).toBeNull()
    await userEvent.hover(trigger)
    const tip = screen.getByRole('tooltip')
    expect(tip).toHaveTextContent('시군구 산출값')
    expect(trigger).toHaveAttribute('aria-describedby', tip.id)
    await userEvent.unhover(trigger)
    expect(screen.queryByRole('tooltip')).toBeNull()
  })

  it('포커스로도 열린다', async () => {
    render(
      <Tooltip content="안내">
        <button type="button">버튼</button>
      </Tooltip>,
    )
    await userEvent.tab()
    expect(screen.getByRole('tooltip')).toHaveTextContent('안내')
  })
})
