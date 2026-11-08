import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import CustomMetricToggles from '@/features/tier/components/CustomMetricToggles'

describe('CustomMetricToggles', () => {
  it('5개 토글, 선택 상태와 개수 안내', () => {
    render(<CustomMetricToggles selected={['quiet', 'crowd', 'overnight']} onChange={() => {}} />)
    const group = screen.getByRole('group', { name: '포함 지표' })
    expect(group).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '동네 조용함', pressed: true })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '또래 밀도', pressed: false })).toBeInTheDocument()
    expect(
      screen.getByText('선택한 지표만 같은 가중치로 평균합니다 · 3개 선택'),
    ).toBeInTheDocument()
  })

  it('켜면 METRIC_KEYS 순서로 정렬해 onChange', async () => {
    const onChange = vi.fn()
    render(<CustomMetricToggles selected={['vibe']} onChange={onChange} />)
    await userEvent.click(screen.getByRole('button', { name: '동네 조용함' }))
    expect(onChange).toHaveBeenCalledWith(['quiet', 'vibe'])
  })

  it('끄면 제거해 onChange', async () => {
    const onChange = vi.fn()
    render(<CustomMetricToggles selected={['quiet', 'vibe']} onChange={onChange} />)
    await userEvent.click(screen.getByRole('button', { name: '동네 조용함' }))
    expect(onChange).toHaveBeenCalledWith(['vibe'])
  })

  it('1개만 남으면 그 칩은 aria-disabled 이고 해제되지 않는다', async () => {
    const onChange = vi.fn()
    render(<CustomMetricToggles selected={['quiet']} onChange={onChange} />)
    const last = screen.getByRole('button', { name: '동네 조용함' })
    expect(last).toHaveAttribute('aria-disabled', 'true')
    await userEvent.hover(last)
    expect(screen.getByRole('tooltip')).toHaveTextContent('최소 1개 지표가 필요합니다')
    await userEvent.click(last)
    expect(onChange).not.toHaveBeenCalled()
  })
})
